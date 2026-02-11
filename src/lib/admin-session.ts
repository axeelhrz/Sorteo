import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 24 * 60 * 60; // 24 horas

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET || 'admin-session-fallback-secret';
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export interface AdminSessionPayload {
  email: string;
  name: string;
  role: 'admin';
  userId: string;
  exp: number;
}

export function createAdminSessionToken(params: { email: string; name: string; userId: string }): string {
  const payload: AdminSessionPayload = {
    email: params.email,
    name: params.name,
    userId: params.userId,
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payloadStr = JSON.stringify(payload);
  const signature = sign(payloadStr);
  return Buffer.from(payloadStr).toString('base64url') + '.' + signature;
}

export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const expectedSig = sign(payloadStr);
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const payload = JSON.parse(payloadStr) as AdminSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAdminSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
