import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get payment document from Firestore
    const paymentRef = doc(db, 'payments', id);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentSnap.data();

    // Return the payment
    return NextResponse.json({
      id: paymentSnap.id,
      ...paymentData,
      createdAt: paymentData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: paymentData.updatedAt?.toDate?.()?.toISOString() || null,
      completedAt: paymentData.completedAt?.toDate?.()?.toISOString() || null,
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}