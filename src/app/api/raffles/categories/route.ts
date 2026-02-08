/**
 * GET /api/raffles/categories
 * Obtiene categorías disponibles (público).
 */
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('products').where('status', '==', 'active').get();

    const categories = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.category) categories.add(data.category);
    });

    return NextResponse.json(Array.from(categories).sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}
