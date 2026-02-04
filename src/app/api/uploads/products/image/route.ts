import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/uploads/products/image
 * Sube una imagen de producto usando Firebase Admin Storage.
 * Evita errores de permisos al ejecutarse en el servidor sin usuario Firebase.
 * Body: FormData con campo "image" (imagen, máx. 5MB).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileName = `products/${timestamp}-${random}-${sanitizedName}`;

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

    return NextResponse.json(
      { fileUrl: signedUrl, fileName },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error uploading image';
    console.error('Error uploading product image:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
