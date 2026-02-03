import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const voucher = formData.get('voucher') as File;
    const paymentId = formData.get('paymentId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const amount = formData.get('amount') as string;
    const ticketQuantity = formData.get('ticketQuantity') as string;

    // Validate required fields
    if (!voucher || !paymentId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if payment exists
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Upload voucher to Firebase Storage
    const timestamp = Date.now();
    const fileName = `vouchers/${paymentId}_${timestamp}_${voucher.name}`;
    const storageRef = ref(storage, fileName);
    
    const arrayBuffer = await voucher.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await uploadBytes(storageRef, bytes, {
      contentType: voucher.type || 'image/jpeg',
    });

    // Get download URL
    const voucherUrl = await getDownloadURL(storageRef);

    // Update payment document in Firestore
    const updateData = {
      status: 'pending_validation',
      paymentMethod,
      voucherUrl,
      voucherUploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      amount: parseFloat(amount),
      ticketQuantity: parseInt(ticketQuantity, 10),
    };

    await updateDoc(paymentRef, updateData);

    // Return the updated payment
    return NextResponse.json({
      id: paymentId,
      ...updateData,
      voucherUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: 'Comprobante subido exitosamente. Tu pago será validado pronto.',
    });

  } catch (error) {
    console.error('Error confirming payment with voucher:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}