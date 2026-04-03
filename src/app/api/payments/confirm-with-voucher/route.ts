import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminStorage, getAdminFirestore } from '@/lib/firebase-admin';
import { sendPaymentValidationEmail } from '@/lib/emails/send-payment-validation';

function paymentMethodLabel(paymentMethod: string): string {
  if (paymentMethod === 'yape') return 'Yape';
  if (paymentMethod === 'plin') return 'Plin';
  if (paymentMethod === 'crypto') return 'Criptomoneda';
  return paymentMethod;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const voucher = formData.get('voucher') as File | null;
    const paymentId = formData.get('paymentId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const amount = formData.get('amount') as string;
    const ticketQuantity = formData.get('ticketQuantity') as string;

    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (paymentId, paymentMethod)' },
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

    const paymentData = paymentSnap.data() || {};
    const currentStatus = paymentData.status as string | undefined;

    if (currentStatus !== 'pending') {
      const message =
        currentStatus === 'pending_validation'
          ? 'Tu comprobante ya fue recibido. Está en validación.'
          : 'Esta participación ya fue procesada.';
      return NextResponse.json({
        id: paymentId,
        status: currentStatus,
        message,
        idempotent: true,
        voucherUrl: paymentData.voucherUrl,
        paymentMethod: paymentData.paymentMethod ?? paymentMethod,
      });
    }

    if (!voucher || typeof (voucher as File).arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (voucher)' },
        { status: 400 }
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

    const finalAmount = parseFloat(amount || String(paymentData.amount ?? '0')) || 0;
    const finalTicketQuantity =
      parseInt(ticketQuantity || String(paymentData.ticketQuantity ?? '1'), 10) || 1;

    let didUpdate = false;
    await adminFirestore.runTransaction(async (transaction) => {
      const snap = await transaction.get(paymentRef);
      if (!snap.exists) {
        return;
      }
      const d = snap.data() || {};
      if (d.status !== 'pending') {
        return;
      }
      transaction.update(paymentRef, {
        status: 'pending_validation',
        paymentMethod,
        voucherUrl,
        voucherUploadedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        amount: finalAmount,
        ticketQuantity: finalTicketQuantity,
      });
      didUpdate = true;
    });

    if (!didUpdate) {
      const fresh = await paymentRef.get();
      const d = fresh.data() || {};
      return NextResponse.json({
        id: paymentId,
        status: d.status,
        message: 'Esta participación ya fue registrada anteriormente.',
        idempotent: true,
        voucherUrl: d.voucherUrl,
        paymentMethod: d.paymentMethod ?? paymentMethod,
      });
    }

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
              paymentMethod: paymentMethodLabel(paymentMethod),
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
