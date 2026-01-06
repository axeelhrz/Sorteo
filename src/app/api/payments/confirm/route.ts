import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionId } = body;

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
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

    // Update payment document in Firestore
    const paymentRef = doc(db, 'payments', paymentId);
    const updateData = {
      status: 'completed',
      transactionId: transactionId || null,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(paymentRef, updateData);

    // Return the updated payment
    return NextResponse.json({
      id: paymentId,
      ...updateData,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}