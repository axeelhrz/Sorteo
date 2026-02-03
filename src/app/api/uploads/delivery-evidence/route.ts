import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/uploads/delivery-evidence
 * Sube una imagen de evidencia de entrega usando Firebase Admin Storage.
 * Evita el error 403 (storage/unauthorized) al no depender de reglas de Storage en el cliente.
 * Body: FormData con campo "file" (imagen, máx. 5MB).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Se requiere el archivo (file)' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileName = `delivery-evidence/${timestamp}-${random}-${sanitizedName}`;

    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type || 'image/jpeg',
      },
    });

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 10);
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires,
    });

    return NextResponse.json({ fileUrl: signedUrl }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al subir la imagen';
    console.error('Error uploading delivery evidence image:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
