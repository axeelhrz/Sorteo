import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WinnerInfo } from '@/types/raffle';

/**
 * GET /api/cron/send-delivery-reminders
 * Cron job que envía recordatorios a ganadores si faltan 2 días para expirar
 * Se ejecuta automáticamente según la configuración de Vercel Cron
 * 
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-delivery-reminders",
 *     "schedule": "0 10 * * *"  // Diariamente a las 10:00 UTC
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

    console.log('Starting delivery reminder check...');

    // Obtener todos los sorteos con estado 'delivered'
    const rafflesRef = collection(db, 'raffles');
    const q = query(rafflesRef, where('winnerInfo.deliveryStatus', '==', 'delivered'));
    const querySnapshot = await getDocs(q);

    let remindersCount = 0;
    const now = new Date();

    for (const docSnap of querySnapshot.docs) {
      const raffleData = docSnap.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;

      if (!winnerInfo || !winnerInfo.deliveryDeadline || winnerInfo.reminderSent) {
        continue;
      }

      // Convertir deadline a Date si es necesario
      const deadline = winnerInfo.deliveryDeadline instanceof Date
        ? winnerInfo.deliveryDeadline
        : new Date(winnerInfo.deliveryDeadline);

      // Calcular días restantes
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Si faltan exactamente 2 días, enviar recordatorio
      if (diffDays === 2 && !winnerInfo.reminderSent) {
        try {
          // Enviar email de recordatorio
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send-delivery-reminder`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: winnerInfo.userEmail,
                name: winnerInfo.userName,
                raffleTitle: raffleData.product?.name || 'Sorteo',
                productName: raffleData.product?.name || 'Premio',
                daysRemaining: diffDays,
              }),
            }
          );

          if (emailResponse.ok) {
            // Marcar que el recordatorio fue enviado
            await updateDoc(doc(db, 'raffles', docSnap.id), {
              'winnerInfo.reminderSent': true,
              'winnerInfo.reminderSentAt': serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            remindersCount++;
            console.log(`Reminder sent for raffle: ${docSnap.id}`);
          } else {
            console.warn(`Error sending reminder for raffle ${docSnap.id}:`, emailResponse.statusText);
          }
        } catch (error) {
          console.error(`Error sending reminder for raffle ${docSnap.id}:`, error);
        }
      }
    }

    console.log(`Delivery reminder check completed. Reminders sent: ${remindersCount}`);

    return NextResponse.json({
      success: true,
      message: `Reminder check completed. ${remindersCount} reminders sent.`,
      remindersCount,
    });
  } catch (error: any) {
    console.error('Error in delivery reminder check:', error);
    return NextResponse.json(
      { error: error.message || 'Error checking deliveries' },
      { status: 500 }
    );
  }
}