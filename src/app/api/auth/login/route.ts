import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth/jwt';
import { getJwtSecret } from '@/lib/auth/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const adminUser = process.env.MYADMINCAPTIVA_USER;
    const adminPass = process.env.MYADMINCAPTIVA_PASS;
    if (!adminUser || !adminPass) {
      return NextResponse.json({ error: 'Auth is not configured' }, { status: 500 });
    }

    // Constant-time comparison mitigation
    const matchUser = adminUser.length === username.length && crypto.timingSafeEqual(Buffer.from(adminUser), Buffer.from(username));
    const matchPass = adminPass.length === password.length && crypto.timingSafeEqual(Buffer.from(adminPass), Buffer.from(password));

    if (!matchUser || !matchPass) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const secret = getJwtSecret();
    const token = signJWT(
      {
        sub: adminUser,
        role: 'admin',
        iss: 'myadmin-captiva',
        aud: 'myadmin-captiva-ui',
      },
      secret,
      60 * 60 // 1 hour
    );

    return NextResponse.json({ token, expiresIn: 3600 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Login failed' }, { status: 500 });
  }
}
