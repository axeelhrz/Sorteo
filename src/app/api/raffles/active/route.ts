/**
 * GET /api/raffles/active
 * Obtiene oportunidades activas (público, no requiere autenticación).
 * Usa Firebase Admin para evitar restricciones de reglas de Firestore.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { RaffleStatus } from '@/types/raffle';

const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
};

export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);

    const shopId = searchParams.get('shopId') || undefined;
    const category = searchParams.get('category') || undefined;
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const deliveryType = searchParams.get('deliveryType') || 'all';
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') || 'newest') as 'newest' | 'closest' | 'price-asc' | 'price-desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    let query = db.collection('raffles').where('status', '==', RaffleStatus.ACTIVE);
    if (shopId) {
      query = query.where('shopId', '==', shopId) as any;
    }

    const snapshot = await query.get();

    const convertWinnerInfo = (raw: any) => {
      if (!raw || typeof raw !== 'object') return undefined;
      return {
        userId: raw.userId || '',
        userName: raw.userName,
        userEmail: raw.userEmail,
        ticketId: raw.ticketId || '',
        ticketNumber: raw.ticketNumber ?? 0,
        verificationCode: raw.verificationCode || '',
        notifiedAt: raw.notifiedAt ? convertTimestamp(raw.notifiedAt) : undefined,
        claimedAt: raw.claimedAt ? convertTimestamp(raw.claimedAt) : undefined,
        deliveryStatus: raw.deliveryStatus || 'pending',
        deliveryEvidence: raw.deliveryEvidence,
        deliveryConfirmedAt: raw.deliveryConfirmedAt ? convertTimestamp(raw.deliveryConfirmedAt) : undefined,
        deliveryConfirmedBy: raw.deliveryConfirmedBy,
        deliveryDeadline: raw.deliveryDeadline ? convertTimestamp(raw.deliveryDeadline) : undefined,
      };
    };

    const raffles: any[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let shop: any = null;
      let product: any = null;

      if (data.shopId) {
        try {
          const shopDoc = await db.collection('shops').doc(data.shopId).get();
          if (shopDoc.exists) {
            const shopData = shopDoc.data()!;
            shop = {
              id: shopDoc.id,
              userId: shopData.userId || '',
              name: shopData.name || '',
              description: shopData.description,
              logo: shopData.logo,
              publicEmail: shopData.publicEmail,
              phone: shopData.phone,
              socialMedia: shopData.socialMedia,
              status: shopData.status || 'pending',
              createdAt: convertTimestamp(shopData.createdAt),
              updatedAt: convertTimestamp(shopData.updatedAt),
            };
          }
        } catch (e) {
          console.error('Error loading shop:', e);
        }
      }

      if (data.productId) {
        try {
          const productDoc = await db.collection('products').doc(data.productId).get();
          if (productDoc.exists) {
            const productData = productDoc.data()!;
            product = {
              id: productDoc.id,
              shopId: productData.shopId || '',
              name: productData.name || '',
              description: productData.description || '',
              value: productData.value || 0,
              height: productData.height || 0,
              width: productData.width || 0,
              depth: productData.depth || 0,
              requiresDeposit: productData.requiresDeposit || false,
              category: productData.category,
              mainImage: productData.mainImage,
              status: productData.status || 'inactive',
              hasDelivery: productData.hasDelivery,
              deliveryZones: productData.deliveryZones,
              deliveryCost: productData.deliveryCost,
              pickupAddress: productData.pickupAddress,
              pickupDistrict: productData.pickupDistrict,
              pickupInStore: productData.pickupInStore,
              createdAt: convertTimestamp(productData.createdAt),
              updatedAt: convertTimestamp(productData.updatedAt),
            };
          }
        } catch (e) {
          console.error('Error loading product:', e);
        }
      }

      raffles.push({
        id: doc.id,
        shopId: data.shopId || '',
        productId: data.productId || '',
        productValue: data.productValue || 0,
        totalTickets: data.totalTickets || 0,
        soldTickets: data.soldTickets || 0,
        status: data.status || RaffleStatus.DRAFT,
        requiresDeposit: data.requiresDeposit || false,
        thumbnail: data.thumbnail,
        winnerTicketId: data.winnerTicketId,
        winnerInfo: convertWinnerInfo(data.winnerInfo),
        specialConditions: data.specialConditions,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        activatedAt: data.activatedAt ? convertTimestamp(data.activatedAt) : undefined,
        raffleExecutedAt: data.raffleExecutedAt ? convertTimestamp(data.raffleExecutedAt) : undefined,
        shop,
        product,
      });
    }

    // Filtros en memoria
    let filtered = raffles;
    if (category) {
      filtered = filtered.filter((r) => r.product?.category === category);
    }
    if (minValue != null) {
      const min = parseFloat(minValue);
      if (!isNaN(min)) filtered = filtered.filter((r) => r.productValue >= min);
    }
    if (maxValue != null) {
      const max = parseFloat(maxValue);
      if (!isNaN(max)) filtered = filtered.filter((r) => r.productValue <= max);
    }
    if (deliveryType && deliveryType !== 'all') {
      if (deliveryType === 'delivery') {
        filtered = filtered.filter((r) => r.product?.hasDelivery === true);
      } else if (deliveryType === 'pickup') {
        filtered = filtered.filter((r) => r.product?.pickupInStore === true);
      }
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.product?.name?.toLowerCase().includes(searchLower) ||
          r.product?.description?.toLowerCase().includes(searchLower) ||
          r.shop?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'closest') {
      filtered.sort((a, b) => b.soldTickets - a.soldTickets);
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.productValue - b.productValue);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.productValue - a.productValue);
    } else {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    return NextResponse.json(
      { message: 'Error al cargar las oportunidades' },
      { status: 500 }
    );
  }
}
