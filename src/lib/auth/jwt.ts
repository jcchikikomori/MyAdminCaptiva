import crypto from 'crypto';

// Minimal HS256 JWT implementation using Node crypto

const textEncoder = new TextEncoder();

function base64url(input: Buffer | string) {
  const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buff
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlJSON(obj: Record<string, any>) {
  return base64url(Buffer.from(JSON.stringify(obj)));
}

export type JwtPayload = {
  sub: string;
  role?: string;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
};

export function signJWT(payload: JwtPayload, secret: string, expiresInSeconds: number = 3600) {
  if (!secret) throw new Error('Missing AUTH_JWT_SECRET');
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp || now + expiresInSeconds;
  const fullPayload = { iat: now, ...payload, exp } as JwtPayload;
  const headerB64 = base64urlJSON(header);
  const payloadB64 = base64urlJSON(fullPayload);
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  const signatureB64 = base64url(sig);
  return `${data}.${signatureB64}`;
}

export function verifyJWT(token: string, secret: string): JwtPayload | null {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const data = `${h}.${p}`;
    const sig = crypto.createHmac('sha256', secret).update(data).digest();
    const signatureB64 = base64url(sig);
    if (signatureB64 !== s) return null;
    const payloadJson = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

