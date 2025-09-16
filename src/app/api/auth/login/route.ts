import { NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth/jwt';
import { getJwtSecret } from '@/lib/auth/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { username, password, bypassKey = '' } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const adminUser = process.env.MYADMINCAPTIVA_USER;
    const adminPass = process.env.MYADMINCAPTIVA_PASS;
    const adminBypassKey = process.env.MYADMINCAPTIVA_BYPASS_KEY;

    if (!adminUser || !adminPass || !adminBypassKey) {
      return NextResponse.json({ error: 'Auth is not configured' }, { status: 500 });
    }

    // Constant-time comparison mitigation
    const matchUser = adminUser.length === username.length && crypto.timingSafeEqual(Buffer.from(adminUser), Buffer.from(username));
    const matchPass = adminPass.length === password.length && crypto.timingSafeEqual(Buffer.from(adminPass), Buffer.from(password));

    // Optional: bypass key for alternative auth
    const matchBypassKey = adminBypassKey.length === bypassKey.length && crypto.timingSafeEqual(Buffer.from(adminBypassKey), Buffer.from(bypassKey));

    if (!matchUser || !matchPass) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    var duration = 60 * 60; // 1 hour
    var durationEpoch = 3600; // in seconds
    if (matchBypassKey) {
      // 1 year
      duration = 365 * 24 * 60 * 60; // 1 year
      durationEpoch = 31536000; // in seconds
    }

    var role = 'admin';
    if (matchBypassKey) {
      role = 'bypassed';
    }

    const secret = getJwtSecret();
    const token = signJWT(
      {
        sub: adminUser,
        role: role,
        iss: 'myadmin-captiva',
        aud: 'myadmin-captiva-ui',
      },
      secret,
      duration
    );

    return NextResponse.json({ token, expiresIn: durationEpoch });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Login failed' }, { status: 500 });
  }
}
