import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminStorage, getAdminFirestore } from '@/lib/firebase-admin';
import { sendPaymentValidationEmail } from '@/lib/emails/send-payment-validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const voucher = formData.get('voucher') as File;
    const paymentId = formData.get('paymentId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const amount = formData.get('amount') as string;
    const ticketQuantity = formData.get('ticketQuantity') as string;

    if (!voucher || !paymentId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (voucher, paymentId, paymentMethod)' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión e intenta de nuevo.' },
        { status: 401 }
      );
    }

    const adminFirestore = getAdminFirestore();
    const paymentRef = adminFirestore.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    const arrayBuffer = await voucher.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = (voucher.name || 'voucher').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `vouchers/${paymentId}_${Date.now()}_${sanitizedName}`;

    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: voucher.type || 'image/jpeg',
      },
    });

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 10);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires,
    });
    const voucherUrl = signedUrl;

    const paymentData = paymentSnap.data() || {};
    const finalAmount = parseFloat(amount || paymentData.amount || '0') || 0;
    const finalTicketQuantity = parseInt(ticketQuantity || paymentData.ticketQuantity || '1', 10) || 1;

    await paymentRef.update({
      status: 'pending_validation',
      paymentMethod,
      voucherUrl,
      voucherUploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      amount: finalAmount,
      ticketQuantity: finalTicketQuantity,
    });

    // Enviar correo de participación registrada al usuario
    const userId = paymentData.userId as string | undefined;
    if (userId) {
      try {
        const userSnap = await adminFirestore.collection('users').doc(userId).get();
        const userData = userSnap.exists ? userSnap.data() : null;
        const userEmail = userData?.email;
        const userName = userData?.name || userData?.displayName || 'Usuario';

        if (userEmail) {
          try {
            await sendPaymentValidationEmail({
              email: userEmail,
              name: userName,
              ticketQuantity: finalTicketQuantity,
              amount: finalAmount,
              paymentMethod: paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'plin' ? 'Plin' : paymentMethod,
            });
          } catch (emailErr) {
            console.warn('No se pudo enviar el correo de participación:', emailErr);
          }
        }
      } catch (emailErr) {
        console.warn('Error enviando correo de participación:', emailErr);
      }
    }

    return NextResponse.json({
      id: paymentId,
      status: 'pending_validation',
      paymentMethod,
      voucherUrl,
      voucherUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: 'Comprobante subido correctamente. Tu pago será validado pronto.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error confirming payment with voucher:', error);
    return NextResponse.json(
      {
        error: 'Error al subir el comprobante',
        details: message,
      },
      { status: 500 }
    );
  }
}
