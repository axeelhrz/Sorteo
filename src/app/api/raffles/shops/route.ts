/**
 * GET /api/raffles/shops
 * Obtiene organizadores con oportunidades activas (público).
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

    const shopIds = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.shopId) shopIds.add(data.shopId);
    });

    const shops: Array<{ id: string; name: string }> = [];
    for (const shopId of shopIds) {
      try {
        const shopDoc = await db.collection('shops').doc(shopId).get();
        if (shopDoc.exists) {
          const shopData = shopDoc.data()!;
          shops.push({
            id: shopDoc.id,
            name: shopData.name || 'Organizador sin nombre',
          });
        }
      } catch (e) {
        console.error(`Error loading shop ${shopId}:`, e);
      }
    }

    return NextResponse.json(shops.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json([]);
  }
}
