/**
 * GET /api/raffles/[id]
 * Obtiene una oportunidad por ID (público, no requiere autenticación).
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'ID requerido' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = await db.collection('raffles').doc(id).get();

    if (!docRef.exists) {
      return NextResponse.json({ message: 'Oportunidad no encontrada' }, { status: 404 });
    }

    const data = docRef.data()!;
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

    const raffle = {
      id: docRef.id,
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
      solesPerUsdcAtApproval:
        typeof data.solesPerUsdcAtApproval === 'number' && Number.isFinite(data.solesPerUsdcAtApproval)
          ? data.solesPerUsdcAtApproval
          : undefined,
      ticketUnitUsdc:
        typeof data.ticketUnitUsdc === 'number' && Number.isFinite(data.ticketUnitUsdc)
          ? data.ticketUnitUsdc
          : undefined,
      shop,
      product,
    };

    return NextResponse.json(raffle);
  } catch (error) {
    console.error('Error fetching raffle:', error);
    return NextResponse.json(
      { message: 'Error al cargar la oportunidad' },
      { status: 500 }
    );
  }
}
