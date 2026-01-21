import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Cron Job para verificar y auto-confirmar entregas después de 7 días
 * Se ejecuta diariamente a las 00:00 (configurado en vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('❌ CRON_SECRET no está configurado');
      return NextResponse.json(
        { error: 'Cron job no configurado correctamente' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Autorización inválida para cron job');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 Iniciando verificación de entregas pendientes...');

    // Buscar sorteos con estado 'delivered'
    const rafflesRef = collection(db, 'raffles');
    const q = query(
      rafflesRef,
      where('winnerInfo.deliveryStatus', '==', 'delivered')
    );

    const snapshot = await getDocs(q);
    let autoConfirmed = 0;
    let checked = 0;
    const results = [];

    for (const raffleDoc of snapshot.docs) {
      checked++;
      const raffle = raffleDoc.data();
      const winnerInfo = raffle.winnerInfo;

      if (!winnerInfo || !winnerInfo.deliveryDeadline) {
        console.log(`⚠️ Sorteo ${raffleDoc.id}: Sin fecha límite de entrega`);
        continue;
      }

      // Convertir Timestamp de Firestore a Date
      const deadline = winnerInfo.deliveryDeadline.toDate
        ? winnerInfo.deliveryDeadline.toDate()
        : new Date(winnerInfo.deliveryDeadline);

      const now = new Date();

      // Si la fecha límite ha pasado, auto-confirmar
      if (now > deadline) {
        try {
          const raffleRef = doc(db, 'raffles', raffleDoc.id);
          await updateDoc(raffleRef, {
            'winnerInfo.deliveryStatus': 'confirmed',
            'winnerInfo.deliveryConfirmedAt': serverTimestamp(),
            'winnerInfo.deliveryConfirmedBy': 'system_auto_confirm',
            updatedAt: serverTimestamp(),
          });

          autoConfirmed++;
          results.push({
            raffleId: raffleDoc.id,
            status: 'auto-confirmed',
            deadline: deadline.toISOString(),
          });

          console.log(`✅ Auto-confirmado sorteo ${raffleDoc.id}`);
        } catch (error) {
          console.error(`❌ Error al auto-confirmar sorteo ${raffleDoc.id}:`, error);
          results.push({
            raffleId: raffleDoc.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } else {
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`⏰ Sorteo ${raffleDoc.id}: ${daysRemaining} días restantes`);
        results.push({
          raffleId: raffleDoc.id,
          status: 'pending',
          daysRemaining,
          deadline: deadline.toISOString(),
        });
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      checked,
      autoConfirmed,
      message: `Verificados ${checked} sorteos, ${autoConfirmed} auto-confirmados`,
      results,
    };

    console.log('✅ Proceso completado:', summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('❌ Error en cron job:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error desconocido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint POST para ejecutar manualmente el cron job (solo en desarrollo)
 */
export async function POST() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint no disponible en producción' },
      { status: 403 }
    );
  }

  console.log('🔧 Ejecutando cron job manualmente (desarrollo)...');

  // Reutilizar la lógica del GET pero sin verificar autorización
  try {
    const rafflesRef = collection(db, 'raffles');
    const q = query(
      rafflesRef,
      where('winnerInfo.deliveryStatus', '==', 'delivered')
    );

    const snapshot = await getDocs(q);
    let autoConfirmed = 0;
    let checked = 0;
    const results = [];

    for (const raffleDoc of snapshot.docs) {
      checked++;
      const raffle = raffleDoc.data();
      const winnerInfo = raffle.winnerInfo;

      if (!winnerInfo || !winnerInfo.deliveryDeadline) {
        continue;
      }

      const deadline = winnerInfo.deliveryDeadline.toDate
        ? winnerInfo.deliveryDeadline.toDate()
        : new Date(winnerInfo.deliveryDeadline);

      const now = new Date();

      if (now > deadline) {
        try {
          const raffleRef = doc(db, 'raffles', raffleDoc.id);
          await updateDoc(raffleRef, {
            'winnerInfo.deliveryStatus': 'confirmed',
            'winnerInfo.deliveryConfirmedAt': serverTimestamp(),
            'winnerInfo.deliveryConfirmedBy': 'system_auto_confirm',
            updatedAt: serverTimestamp(),
          });

          autoConfirmed++;
          results.push({
            raffleId: raffleDoc.id,
            status: 'auto-confirmed',
          });
        } catch (error) {
          results.push({
            raffleId: raffleDoc.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'manual',
      timestamp: new Date().toISOString(),
      checked,
      autoConfirmed,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}