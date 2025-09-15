import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, type JwtPayload } from './jwt';

export function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error('AUTH_JWT_SECRET is not set');
  return secret;
}

export function getBearer(req: Request | NextRequest): string | null {
  const auth = (req as any).headers?.get?.('authorization') || (req as any).headers?.get?.('Authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export function requireAuth(req: Request | NextRequest): { ok: boolean; payload?: JwtPayload; res?: NextResponse } {
  try {
    const token = getBearer(req);
    if (!token) return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    const secret = getJwtSecret();
    const payload = verifyJWT(token, secret);
    if (!payload) return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    return { ok: true, payload };
  } catch (e: any) {
    return { ok: false, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

