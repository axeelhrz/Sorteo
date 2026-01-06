import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { failureReason } = body;

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update payment document in Firestore
    const paymentRef = doc(db, 'payments', id);
    const updateData = {
      status: 'failed',
      failureReason: failureReason || 'Payment cancelled by user',
      failedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(paymentRef, updateData);

    // Return the updated payment
    return NextResponse.json({
      id,
      ...updateData,
      failedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error failing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}