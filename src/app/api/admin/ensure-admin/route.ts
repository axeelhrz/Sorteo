import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tiketea.online@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tiketea_admin123';

/**
 * POST /api/admin/ensure-admin
 * Crea el usuario administrador en Firebase Auth y Firestore si no existe.
 * Protegido por ADMIN_SETUP_SECRET en el header.
 *
 * Uso (una sola vez): curl -X POST -H "x-setup-secret: tu_secret" https://tu-app.com/api/admin/ensure-admin
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-setup-secret');
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'No autorizado. Configura ADMIN_SETUP_SECRET y envíalo en el header x-setup-secret.' },
        { status: 401 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    let uid: string;

    try {
      const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
      uid = existingUser.uid;
      await auth.updateUser(uid, { password: ADMIN_PASSWORD });
    } catch {
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: 'Administrador TIKETEA',
        emailVerified: true,
      });
      uid = newUser.uid;
    }

    await db.collection('users').doc(uid).set(
      {
        name: 'Administrador TIKETEA',
        email: ADMIN_EMAIL,
        role: 'admin',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario administrador configurado correctamente',
      email: ADMIN_EMAIL,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al configurar admin';
    console.error('ensure-admin error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
