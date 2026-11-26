import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const FALLBACK_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured && configured.trim().length >= 16) {
    return configured.trim();
  }
  return FALLBACK_SESSION_SECRET;
}

export function hashPasscodeScrypt(passcode: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPasscodeScrypt(passcode: string, storedValue: string): boolean {
  const parts = storedValue.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  const actualBuf = crypto.scryptSync(passcode, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function verifyEnvPasscode(input: string, envPasscode: string): boolean {
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(envPasscode).digest();
  return crypto.timingSafeEqual(a, b);
}

export function signAdminSessionToken(): { token: string; expiresInMs: number } {
  const payloadObj = {
    role: 'admin',
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return {
    token: `${payloadB64}.${sig}`,
    expiresInMs: ADMIN_SESSION_TTL_MS,
  };
}

export function verifyAdminSessionToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;
    if (!payloadB64 || !sigB64) return false;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest('base64url');
    const a = Buffer.from(sigB64);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (decoded?.role !== 'admin' || typeof decoded?.exp !== 'number') {
      return false;
    }
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export interface DbUserRecord {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  lineId: string | null;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: DbUserRecord;
  isAdminPasscodeSession?: boolean;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || '',
      decodedToken.name,
      decodedToken.picture
    );
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      req.dbUser = await getOrCreateUser(
        decodedToken.uid,
        decodedToken.email || '',
        decodedToken.name,
        decodedToken.picture
      );
    } catch {
      // Proceed as guest when optional token is invalid
    }
  }
  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }
  const isOwnerEmail =
    req.dbUser.email.toLowerCase() === 'pragopkhammool@gmail.com';
  if (req.dbUser.role !== 'admin' && !isOwnerEmail) {
    return res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
  }
  next();
};

export const requireAdminSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const headerAdminToken = req.headers['x-admin-token'];
  if (typeof headerAdminToken === 'string' && verifyAdminSessionToken(headerAdminToken)) {
    req.isAdminPasscodeSession = true;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (verifyAdminSessionToken(token)) {
      req.isAdminPasscodeSession = true;
      return next();
    }
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      const dbUser = await getOrCreateUser(
        decodedToken.uid,
        decodedToken.email || '',
        decodedToken.name,
        decodedToken.picture
      );
      req.dbUser = dbUser;
      const isOwnerEmail =
        dbUser.email.toLowerCase() === 'pragopkhammool@gmail.com';
      if (dbUser.role === 'admin' || isOwnerEmail) {
        return next();
      }
      return res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    } catch {
      return res.status(401).json({ error: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
  }

  return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบผู้ดูแล (Admin)' });
};

