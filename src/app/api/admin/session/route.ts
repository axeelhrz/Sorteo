import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  getAdminSessionCookie,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from '@/lib/admin-session';
import { verifyAdminCredentials } from '@/server/admin-credentials';

export const dynamic = 'force-dynamic';

const FALLBACK_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'tiketea.online@gmail.com').toLowerCase().trim();
const FALLBACK_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tiketea_admin123';
const FALLBACK_ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';

/**
 * POST /api/admin/session
 * Login con email y contraseña. No usa Firebase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';

    let adminUser = await verifyAdminCredentials(email, password);
    if (!adminUser && email === FALLBACK_ADMIN_EMAIL && password === FALLBACK_ADMIN_PASSWORD) {
      adminUser = {
        id: 'env-admin',
        name: FALLBACK_ADMIN_NAME,
        email: FALLBACK_ADMIN_EMAIL,
        passwordHash: '',
      };
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = createAdminSessionToken({
      email: adminUser.email,
      name: adminUser.name,
      userId: adminUser.id,
    });
    const response = NextResponse.json({
      success: true,
      user: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
    });
    response.headers.set('Set-Cookie', setAdminSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}

/**
 * GET /api/admin/session
 * Verifica si hay sesión admin activa.
 */
export async function GET(request: NextRequest) {
  try {
    const token = getAdminSessionCookie(request);
    if (!token) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const payload = verifyAdminSessionToken(token);
    if (!payload) {
      const response = NextResponse.json({ ok: false }, { status: 401 });
      response.headers.set('Set-Cookie', clearAdminSessionCookie());
      return response;
    }
    return NextResponse.json({
      ok: true,
      user: { id: payload.userId, email: payload.email, name: payload.name },
    });
  } catch (error) {
    console.error('Admin session verify error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/session
 * Cerrar sesión admin.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', clearAdminSessionCookie());
  return response;
}
