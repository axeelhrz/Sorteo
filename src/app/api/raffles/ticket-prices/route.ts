/**
 * GET /api/raffles/ticket-prices
 * Obtiene los precios únicos de tickets de las oportunidades activas (público).
 */
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { RaffleStatus } from '@/types/raffle';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('raffles')
      .where('status', '==', RaffleStatus.ACTIVE)
      .get();

    const prices = new Set<number>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const productValue = data.productValue;
      if (typeof productValue === 'number' && productValue > 0) {
        prices.add(productValue);
      }
    });

    const sortedPrices = Array.from(prices).sort((a, b) => a - b);
    return NextResponse.json(sortedPrices);
  } catch (error) {
    console.error('Error fetching ticket prices:', error);
    return NextResponse.json([], { status: 500 });
  }
}
