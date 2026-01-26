import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WinnerInfo } from '@/types/raffle';

/**
 * GET /api/cron/check-deliveries
 * Cron job que verifica diariamente si hay entregas que deben auto-confirmarse
 * Se ejecuta automáticamente según la configuración de Vercel Cron
 * 
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-deliveries",
 *     "schedule": "0 0 * * *"  // Diariamente a las 00:00 UTC
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que la solicitud viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting delivery auto-confirmation check...');

    // Obtener todos los sorteos con estado 'delivered'
    const rafflesRef = collection(db, 'raffles');
    const q = query(rafflesRef, where('winnerInfo.deliveryStatus', '==', 'delivered'));
    const querySnapshot = await getDocs(q);

    let autoConfirmedCount = 0;
    const now = new Date();

    for (const docSnap of querySnapshot.docs) {
      const raffleData = docSnap.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;

      if (!winnerInfo || !winnerInfo.deliveryDeadline) {
        continue;
      }

      // Convertir deadline a Date si es necesario
      const deadline = winnerInfo.deliveryDeadline instanceof Date
        ? winnerInfo.deliveryDeadline
        : new Date(winnerInfo.deliveryDeadline);

      // Verificar si la fecha límite ha pasado
      if (now > deadline) {
        try {
          // Auto-confirmar la entrega
          await updateDoc(doc(db, 'raffles', docSnap.id), {
            'winnerInfo.deliveryStatus': 'confirmed',
            'winnerInfo.deliveryConfirmedAt': serverTimestamp(),
            'winnerInfo.deliveryConfirmedBy': 'system_auto_confirm',
            updatedAt: serverTimestamp(),
          });

          autoConfirmedCount++;
          console.log(`Auto-confirmed delivery for raffle: ${docSnap.id}`);

          // Aquí se podría enviar un correo al ganador notificando la auto-confirmación
          // await emailService.sendAutoConfirmationEmail({...});
        } catch (error) {
          console.error(`Error auto-confirming delivery for raffle ${docSnap.id}:`, error);
        }
      }
    }

    console.log(`Delivery auto-confirmation check completed. Auto-confirmed: ${autoConfirmedCount}`);

    return NextResponse.json({
      success: true,
      message: `Auto-confirmation check completed. ${autoConfirmedCount} deliveries auto-confirmed.`,
      autoConfirmedCount,
    });
  } catch (error: any) {
    console.error('Error in delivery auto-confirmation check:', error);
    return NextResponse.json(
      { error: error.message || 'Error checking deliveries' },
      { status: 500 }
    );
  }
}