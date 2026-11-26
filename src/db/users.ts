import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

const ADMIN_EMAILS = new Set(['pragopkhammool@gmail.com']);

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string,
  avatar?: string
) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email,
          name: name || existing[0].name,
          avatar: avatar || existing[0].avatar,
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    const defaultRole = ADMIN_EMAILS.has(email.toLowerCase()) ? 'admin' : 'customer';
    const displayName = name || email.split('@')[0] || 'สมาชิก กดแล้วจบ';

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        name: displayName,
        avatar: avatar || null,
        role: defaultRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: displayName,
          avatar: avatar || null,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('ไม่สามารถซิงค์ข้อมูลบัญชีผู้ใช้ได้ในขณะนี้', { cause: error });
  }
}
