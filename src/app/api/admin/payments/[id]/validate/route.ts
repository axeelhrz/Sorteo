import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { emailService } from '@/services/email-service';

/**
 * POST /api/admin/payments/{paymentId}/validate
 * 
 * Valida un pago pendiente (aprueba o rechaza)
 * Si aprueba, asigna los tickets al usuario
 * Envía correo de confirmación al usuario
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const body = await request.json();
    const { approved, notes } = body;

    // Validar campos requeridos
    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo "approved" es requerido y debe ser booleano' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es administrador
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Extraer userId del token para registrar quién aprobó
    const adminId = 'admin_001'; // Placeholder

    // Obtener el pago
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    const paymentData = paymentSnap.data();

    // Verificar que el pago está en estado pendiente
    if (paymentData.status !== 'pending_validation') {
      return NextResponse.json(
        { error: 'El pago no está en estado pendiente de validación' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario y raffle para el correo
    const userRef = doc(db, 'users', paymentData.userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const raffleRef = doc(db, 'raffles', paymentData.raffleId);
    const raffleSnap = await getDoc(raffleRef);
    const raffleData = raffleSnap.data();

    if (approved) {
      // ✅ APROBAR PAGO

      // 1. Asignar tickets al usuario
      const ticketsRef = collection(db, 'raffle_tickets');
      const ticketIds: string[] = [];

      for (let i = 0; i < paymentData.ticketQuantity; i++) {
        const ticketRef = await addDoc(ticketsRef, {
          raffleId: paymentData.raffleId,
          userId: paymentData.userId,
          status: 'assigned',
          assignedAt: serverTimestamp(),
          paymentId: paymentId,
          ticketNumber: null, // Se asignará cuando se realice el sorteo
        });
        ticketIds.push(ticketRef.id);
      }

      // 2. Actualizar estado del pago
      await updateDoc(paymentRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminId,
        approvalNotes: notes || '',
        ticketsAssigned: true,
        ticketIds,
        updatedAt: serverTimestamp(),
      });

      // 3. Enviar correo de aprobación
      try {
        await emailService.sendPaymentApprovedEmail({
          email: userData.email,
          name: userData.name || userData.email,
          raffleName: raffleData?.name || 'Sorteo',
          ticketQuantity: paymentData.ticketQuantity,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod || 'Desconocido',
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // No lanzar error para no bloquear la aprobación
      }

      return NextResponse.json({
        success: true,
        message: 'Pago aprobado exitosamente',
        payment: {
          id: paymentId,
          status: 'approved',
          ticketsAssigned: true,
          ticketIds,
          approvedAt: new Date().toISOString(),
        },
      });

    } else {
      // ❌ RECHAZAR PAGO

      // 1. Actualizar estado del pago
      await updateDoc(paymentRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
        rejectionReason: notes || 'No especificado',
        updatedAt: serverTimestamp(),
      });

      // 2. Enviar correo de rechazo
      try {
        await emailService.sendPaymentRejectedEmail({
          email: userData.email,
          name: userData.name || userData.email,
          amount: paymentData.amount,
          ticketQuantity: paymentData.ticketQuantity,
          paymentMethod: paymentData.paymentMethod || 'Desconocido',
          rejectionReason: notes || 'No especificado',
          paymentId: paymentId,
        });
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // No lanzar error para no bloquear el rechazo
      }

      return NextResponse.json({
        success: true,
        message: 'Pago rechazado exitosamente',
        payment: {
          id: paymentId,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: notes || 'No especificado',
        },
      });
    }

  } catch (error) {
    console.error('Error validating payment:', error);
    return NextResponse.json(
      { 
        error: 'Error al validar el pago',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}