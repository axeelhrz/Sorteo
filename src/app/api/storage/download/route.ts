import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, getBytes } from 'firebase/storage';

/**
 * API Route para descargar archivos de Firebase Storage
 * Esto evita problemas de CORS al actuar como proxy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing file path parameter' },
        { status: 400 }
      );
    }

    // Obtener el archivo de Firebase Storage
    const fileRef = ref(storage, filePath);
    const fileBytes = await getBytes(fileRef);

    // Determinar el tipo de contenido basado en la extensión
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    if (extension === 'png') contentType = 'image/png';
    else if (extension === 'jpg' || extension === 'jpeg') contentType = 'image/jpeg';
    else if (extension === 'gif') contentType = 'image/gif';
    else if (extension === 'webp') contentType = 'image/webp';
    else if (extension === 'svg') contentType = 'image/svg+xml';
    else if (extension === 'pdf') contentType = 'application/pdf';

    // Retornar el archivo con headers CORS apropiados
    return new NextResponse(fileBytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error downloading file from Firebase Storage:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}