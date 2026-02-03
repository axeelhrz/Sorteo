import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';

/**
 * POST /api/admin/raffles/[id]/register-payment
 * Acepta FormData con el campo "evidence" (archivo imagen).
 * Sube la evidencia con Firebase Admin Storage, actualiza el sorteo con Admin Firestore y envía email al organizador.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    if (!raffleId) {
      return NextResponse.json({ error: 'ID de sorteo requerido' }, { status: 400 });
    }

    const formData = await request.formData();
    const evidence = formData.get('evidence') as File | null;
    if (!evidence || !(evidence instanceof File) || evidence.size === 0) {
      return NextResponse.json(
        { error: 'Se requiere el archivo de evidencia (evidence)' },
        { status: 400 }
      );
    }

    if (!evidence.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const raffleRef = db.collection('raffles').doc(raffleId);
    const raffleSnap = await raffleRef.get();

    if (!raffleSnap.exists) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    const raffleData = raffleSnap.data()!;
    const status = raffleData.status;
    if (status !== 'finished') {
      return NextResponse.json(
        { error: 'Solo se puede registrar pago en sorteos finalizados' },
        { status: 400 }
      );
    }

    if (raffleData.paymentToOrganizerAt) {
      return NextResponse.json(
        { error: 'El pago al organizador ya fue registrado para esta oportunidad' },
        { status: 400 }
      );
    }

    const arrayBuffer = await evidence.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = (evidence.name || 'evidence').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `payment-evidence/${raffleId}_${Date.now()}_${sanitizedName}`;

    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: evidence.type || 'image/jpeg',
      },
    });

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 10);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires,
    });
    const paymentEvidenceUrl = signedUrl;

    await raffleRef.update({
      paymentToOrganizerAt: FieldValue.serverTimestamp(),
      paymentEvidenceUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const shopId = raffleData.shopId || '';
    let organizerEmail: string | null = null;
    let shopName = 'Organizador';
    if (shopId) {
      const shopSnap = await db.collection('shops').doc(shopId).get();
      if (shopSnap.exists) {
        const shop = shopSnap.data()!;
        organizerEmail = shop.publicEmail || null;
        shopName = shop.name || shopName;
      }
    }

    const productId = raffleData.productId || '';
    let productName = 'Premio';
    let productValue = raffleData.productValue ?? 0;
    if (productId) {
      const productSnap = await db.collection('products').doc(productId).get();
      if (productSnap.exists) {
        const p = productSnap.data()!;
        productName = p.name || productName;
        productValue = p.value ?? productValue;
      }
    }
    const soldTickets = raffleData.soldTickets || 0;
    const amountPaid = productValue * soldTickets;

    if (organizerEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/emails/send-organizer-payment-done`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: organizerEmail,
            organizerName: shopName,
            raffleId,
            productName,
            amountPaid,
            paymentEvidenceUrl,
          }),
        });
      } catch (e) {
        console.error('Error sending organizer payment done email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pago al organizador registrado y correo enviado.',
      paymentEvidenceUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar el pago';
    console.error('Error registering payment to organizer:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
