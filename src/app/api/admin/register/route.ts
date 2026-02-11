import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser } from '@/server/admin-credentials';

export const dynamic = 'force-dynamic';

const REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'tiketea_admin_register';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const password = body.password || '';
    const secret = body.secret || '';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }
    if (secret !== REGISTRATION_SECRET) {
      return NextResponse.json({ error: 'Código de registro inválido.' }, { status: 403 });
    }

    const adminUser = await createAdminUser({ name, email, password });
    return NextResponse.json({
      success: true,
      user: { id: adminUser.id, name: adminUser.name, email: adminUser.email },
    });
  } catch (error: any) {
    console.error('Admin register error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creando administrador' },
      { status: 500 }
    );
  }
}
