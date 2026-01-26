import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * GET /api/admin/payments/pending
 * 
 * Obtiene todos los pagos pendientes de validación
 * Solo accesible para administradores
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario es administrador
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verificar que el token pertenece a un administrador
    // Por ahora, asumimos que si tiene token válido es admin

    // Obtener pagos pendientes de validación
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('status', '==', 'pending_validation'),
      orderBy('voucherUploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      voucherUploadedAt: doc.data().voucherUploadedAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json({
      success: true,
      count: payments.length,
      payments,
    });

  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener pagos pendientes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}