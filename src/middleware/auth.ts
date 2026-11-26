import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

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
