import { FieldValue } from 'firebase-admin/firestore';
import type { Query } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { assignTicketsToUserAdmin } from './ticket-assignment-admin';

const adminDb = getAdminFirestore();

const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

async function fetchUserData(userId: string) {
  const doc = await adminDb.collection('users').doc(userId).get();
  if (!doc.exists) {
    return { email: 'user@example.com', name: 'Usuario' };
  }
  const data = doc.data() || {};
  return {
    email: data.email || 'user@example.com',
    name: data.name || data.displayName || 'Usuario',
  };
}

async function fetchRaffleData(raffleId: string) {
  const doc = await adminDb.collection('raffles').doc(raffleId).get();
  if (!doc.exists) return { name: 'Sorteo' };
  const data = doc.data() || {};
  let name = 'Sorteo';
  if (data.productId) {
    const productDoc = await adminDb.collection('products').doc(data.productId).get();
    if (productDoc.exists) {
      name = (productDoc.data() || {}).name || 'Sorteo';
    }
  }
  const costPerTicket = data.productValue ?? data.costPerTicket;
  return { name, costPerTicket };
}

async function fetchRaffleDataWithShop(raffleId: string) {
  const doc = await adminDb.collection('raffles').doc(raffleId).get();
  if (!doc.exists) return { name: 'Sorteo' };
  const data = doc.data() || {};
  let name = 'Sorteo';
  if (data.productId) {
    const productDoc = await adminDb.collection('products').doc(data.productId).get();
    if (productDoc.exists) {
      name = (productDoc.data() || {}).name || 'Sorteo';
    }
  }
  return { name, shopId: data.shopId };
}

type AdminRaffleRecord = Record<string, any> & {
  id: string;
  shopId?: string | null;
  productId?: string | null;
};

export const adminSecureService = {
  async getDashboardStats() {
    const [usersSnap, shopsSnap, rafflesSnap, ticketsSnap, paymentsSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('shops').get(),
      adminDb.collection('raffles').get(),
      adminDb.collection('raffle-tickets').get(),
      adminDb.collection('payments').get(),
    ]);

    let pendingShops = 0;
    let verifiedShops = 0;
    let blockedShops = 0;
    shopsSnap.docs.forEach((doc) => {
      const status = (doc.data().status || '').toLowerCase();
      if (status === 'pending') pendingShops++;
      else if (status === 'blocked') blockedShops++;
      else verifiedShops++;
    });

    let pendingRaffles = 0;
    let activeRaffles = 0;
    let finishedRaffles = 0;
    let cancelledRaffles = 0;
    let rejectedRaffles = 0;
    rafflesSnap.docs.forEach((doc) => {
      const status = (doc.data().status || '').toLowerCase();
      if (status === 'pending_approval' || status === 'draft') pendingRaffles++;
      else if (status === 'active' || status === 'sold_out') activeRaffles++;
      else if (status === 'finished') finishedRaffles++;
      else if (status === 'cancelled') cancelledRaffles++;
      else if (status === 'rejected') rejectedRaffles++;
    });

    let completedPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let refundedPayments = 0;
    let totalRevenue = 0;
    paymentsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const status = (data.status || '').toLowerCase();
      if (status === 'completed' || status === 'approved') {
        completedPayments++;
        totalRevenue += data.amount || 0;
      } else if (status === 'pending' || status === 'pending_validation') {
        pendingPayments++;
      } else if (status === 'failed') {
        failedPayments++;
      } else if (status === 'refunded') {
        refundedPayments++;
      }
    });

    let paymentToOrganizers = 0;
    rafflesSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'finished' && data.paymentToOrganizerAt) {
        const sold = data.soldTickets || 0;
        const price = data.productValue || 0;
        paymentToOrganizers += sold * price;
      }
    });

    const platformIncome = Math.max(0, totalRevenue - paymentToOrganizers);

    return {
      users: { total: usersSnap.size },
      shops: {
        total: shopsSnap.size,
        pending: pendingShops,
        verified: verifiedShops,
        blocked: blockedShops,
      },
      raffles: {
        pending: pendingRaffles,
        active: activeRaffles,
        finished: finishedRaffles,
        cancelled: cancelledRaffles,
        rejected: rejectedRaffles,
      },
      tickets: { totalSold: ticketsSnap.size },
      payments: {
        total: paymentsSnap.size,
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments,
        refunded: refundedPayments,
        totalRevenue,
        paymentToOrganizers,
        platformIncome,
      },
    };
  },

  async getPendingPayments() {
    return this.getPayments({ status: 'pending' });
  },

  /**
   * Obtiene pagos con filtros opcionales: status (all | pending | completed), raffleId.
   * pending = pending + pending_validation; completed = aprobados.
   */
  async getPayments(payload?: { status?: string; raffleId?: string }) {
    const status = payload?.status || 'all';
    const raffleId = payload?.raffleId?.trim() || undefined;

    let query: Query = adminDb.collection('payments') as Query;

    if (status === 'pending') {
      query = query.where('status', 'in', ['pending', 'pending_validation']);
    } else if (status === 'completed') {
      query = query.where('status', '==', 'completed');
    } else {
      query = query.where('status', 'in', ['pending', 'pending_validation', 'completed']);
    }

    if (raffleId) {
      query = query.where('raffleId', '==', raffleId);
    }

    const snapshot = await query.get();

    const docs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        voucherUploadedAt: toDate(data.voucherUploadedAt),
      };
    });
    docs.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
    return docs;
  },

  async approvePaymentAndAssignTickets(paymentId: string, adminId: string) {
    const paymentRef = adminDb.collection('payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();
    if (!paymentDoc.exists) {
      throw new Error('Pago no encontrado');
    }
    const paymentData = paymentDoc.data() || {};

    await paymentRef.update({
      status: 'completed',
      approvedBy: adminId,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const assignment = await assignTicketsToUserAdmin(
      paymentData.raffleId,
      paymentData.userId,
      paymentId,
      paymentData.ticketQuantity || 0
    );
    if (!assignment.success) {
      throw new Error(assignment.error || 'Error al asignar tickets');
    }

    const [userData, raffleData] = await Promise.all([
      fetchUserData(paymentData.userId),
      fetchRaffleData(paymentData.raffleId),
    ]);

    return {
      ticketNumbers: assignment.ticketNumbers,
      emailPayload: {
        email: userData.email,
        name: userData.name,
        raffleName: raffleData.name,
        ticketQuantity: paymentData.ticketQuantity || 0,
        amount: paymentData.amount || 0,
        paymentMethod: (paymentData.paymentMethod || 'N/A').toUpperCase(),
      },
    };
  },

  async getUserData(userId: string) {
    return fetchUserData(userId);
  },

  async getRaffleData(raffleId: string) {
    return fetchRaffleData(raffleId);
  },

  async getPendingRaffles(limit: number, offset: number, shopId?: string) {
    const snapshot = await adminDb
      .collection('raffles')
      .where('status', 'in', ['draft', 'pending_approval'])
      .get();

    let raffles: AdminRaffleRecord[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AdminRaffleRecord));

    if (shopId) {
      raffles = raffles.filter((r) => r.shopId === shopId);
    }

    raffles.sort((a, b) => {
      const ta = toDate(a.createdAt)?.getTime() || 0;
      const tb = toDate(b.createdAt)?.getTime() || 0;
      return tb - ta;
    });

    const paginated = raffles.slice(offset, offset + limit);
    const enriched = await Promise.all(
      paginated.map(async (raffle) => {
        const shopDoc = raffle.shopId
          ? await adminDb.collection('shops').doc(raffle.shopId).get()
          : null;
        const productDoc = raffle.productId
          ? await adminDb.collection('products').doc(raffle.productId).get()
          : null;
        const productData = productDoc?.exists ? productDoc.data() : null;
        const product = productData
          ? {
              id: productDoc!.id,
              ...productData,
              value: Math.round(Number(productData.value || 0) * 100) / 100,
            }
          : null;
        return {
          ...raffle,
          shop: shopDoc?.exists ? { id: shopDoc.id, ...shopDoc.data() } : null,
          product,
        };
      })
    );

    return { data: enriched, total: raffles.length };
  },

  async approveRaffle(raffleId: string, params: { costPerTicket: number; totalTickets: number }) {
    const raffleRef = adminDb.collection('raffles').doc(raffleId);
    await raffleRef.update({
      productValue: params.costPerTicket,
      totalTickets: params.totalTickets,
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
      activatedAt: FieldValue.serverTimestamp(),
    });
  },

  async rejectRaffle(raffleId: string, reason?: string) {
    const updateData: Record<string, any> = {
      status: 'rejected',
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (reason) updateData.rejectReason = reason;
    await adminDb.collection('raffles').doc(raffleId).update(updateData);
  },

  async getActiveRaffles(limit: number, offset: number, shopId?: string) {
    const [activeSnap, soldOutSnap] = await Promise.all([
      adminDb.collection('raffles').where('status', '==', 'active').get(),
      adminDb.collection('raffles').where('status', '==', 'sold_out').get(),
    ]);
    let raffles: AdminRaffleRecord[] = [...activeSnap.docs, ...soldOutSnap.docs].map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      activatedAt: toDate(doc.data().activatedAt),
    } as AdminRaffleRecord));
    if (shopId) {
      raffles = raffles.filter((r) => r.shopId === shopId);
    }
    const paginated = raffles.slice(offset, offset + limit);
    const enriched = await Promise.all(
      paginated.map(async (raffle) => {
        const shopDoc = raffle.shopId
          ? await adminDb.collection('shops').doc(raffle.shopId).get()
          : null;
        const productDoc = raffle.productId
          ? await adminDb.collection('products').doc(raffle.productId).get()
          : null;
        const productData = productDoc?.exists ? productDoc.data() : null;
        const product = productData
          ? { id: productDoc!.id, ...productData, value: Math.round(Number(productData.value || 0) * 100) / 100 }
          : null;
        return {
          ...raffle,
          shop: shopDoc?.exists ? { id: shopDoc.id, ...shopDoc.data() } : null,
          product,
        };
      })
    );
    return { data: enriched, total: raffles.length };
  },

  async cancelRaffle(raffleId: string, reason?: string) {
    const updateData: Record<string, any> = {
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (reason) updateData.cancelReason = reason;
    await adminDb.collection('raffles').doc(raffleId).update(updateData);
  },

  async getFinishedRaffles(limit: number, offset: number, shopId?: string) {
    const snapshot = await adminDb.collection('raffles').where('status', '==', 'finished').get();
    let raffles: AdminRaffleRecord[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        shopId: data.shopId ?? null,
        productId: data.productId ?? null,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        activatedAt: toDate(data.activatedAt),
        raffleExecutedAt: toDate(data.raffleExecutedAt),
        paymentToOrganizerAt: toDate(data.paymentToOrganizerAt),
      };
    });
    if (shopId) {
      raffles = raffles.filter((r) => r.shopId === shopId);
    }
    const paginated = raffles.slice(offset, offset + limit);
    const enriched = await Promise.all(
      paginated.map(async (raffle) => {
        const shopDoc = raffle.shopId
          ? await adminDb.collection('shops').doc(raffle.shopId).get()
          : null;
        const productDoc = raffle.productId
          ? await adminDb.collection('products').doc(raffle.productId).get()
          : null;
        const productData = productDoc?.exists ? productDoc.data() : null;
        const product = productData
          ? { id: productDoc!.id, ...productData, value: Math.round(Number(productData.value || 0) * 100) / 100 }
          : null;
        return {
          ...raffle,
          shop: shopDoc?.exists ? { id: shopDoc.id, ...shopDoc.data() } : null,
          product,
        };
      })
    );
    return { data: enriched, total: raffles.length };
  },

  async getPaymentHistory(filters?: {
    tipo?: 'compra' | 'pago_organizador';
    shopId?: string;
    userId?: string;
    oportunidad?: string;
  }) {
    const [paymentsSnap, finishedRaffles] = await Promise.all([
      adminDb.collection('payments').limit(300).get(),
      this.getFinishedRaffles(300, 0),
    ]);

    const organizerPayments = finishedRaffles.data.filter((r: any) => r.paymentToOrganizerAt);

    const compras = await Promise.all(
      paymentsSnap.docs.map(async (doc) => {
        const data = doc.data();
      const [user, raffle] = await Promise.all([
        fetchUserData(data.userId),
        fetchRaffleDataWithShop(data.raffleId),
        ]);
        const date = toDate(data.completedAt || data.createdAt) || new Date(0);
        return {
          id: doc.id,
          type: 'compra' as const,
          date,
          amount: data.amount || 0,
          status: data.status,
          userName: user.name,
          userEmail: user.email,
          shopId: raffle.shopId,
          opportunityName: raffle.name,
          raffleId: data.raffleId,
          ticketQuantity: data.ticketQuantity,
          userId: data.userId,
        };
      })
    );

    const pagosOrg = organizerPayments.map((r: any) => {
      const amount = (r.soldTickets || 0) * (r.productValue || 0);
      const date = r.paymentToOrganizerAt || new Date(0);
      return {
        id: `org-${r.id}`,
        type: 'pago_organizador' as const,
        date,
        amount,
        shopName: r.shop?.name || 'N/A',
        shopId: r.shopId,
        opportunityName: r.product?.name || 'N/A',
        raffleId: r.id,
        paymentEvidenceUrl: r.paymentEvidenceUrl,
      };
    });

    let items = [...compras, ...pagosOrg].sort(
      (a, b) => (toDate(b.date)?.getTime() || 0) - (toDate(a.date)?.getTime() || 0)
    );

    if (filters?.tipo) {
      items = items.filter((i) => i.type === filters.tipo);
    }
    if (filters?.shopId) {
      items = items.filter((i: any) => i.shopId === filters.shopId);
    }
    if (filters?.userId) {
      items = items.filter((i: any) => i.userId === filters.userId);
    }
    if (filters?.oportunidad) {
      const q = filters.oportunidad.toLowerCase();
      items = items.filter((i) => (i.opportunityName || '').toLowerCase().includes(q));
    }

    const shopIds = new Set<string>();
    const userIds = new Set<string>();
    compras.forEach((c) => {
      if ((c as any).shopId) shopIds.add((c as any).shopId);
      if ((c as any).userId) userIds.add((c as any).userId);
    });
    organizerPayments.forEach((r: any) => {
      if (r.shopId) shopIds.add(r.shopId);
    });

    const shops: Array<{ id: string; name: string }> = [];
    for (const sid of shopIds) {
      const doc = await adminDb.collection('shops').doc(sid).get();
      if (doc.exists) {
        shops.push({ id: doc.id, name: (doc.data() || {}).name || 'N/A' });
      }
    }
    shops.sort((a, b) => a.name.localeCompare(b.name));

    const users: Array<{ id: string; name: string; email: string }> = [];
    for (const uid of userIds) {
      const user = await fetchUserData(uid);
      users.push({ id: uid, name: user.name, email: user.email });
    }
    users.sort((a, b) => a.name.localeCompare(b.name));

    return {
      items: items.map((i: any) => ({
        ...i,
        date: toDate(i.date)?.toISOString() || new Date(0).toISOString(),
      })),
      shops,
      users,
    };
  },

  async getAllUsers(limit: number, offset: number, filters?: { role?: string }) {
    const snapshot = await adminDb.collection('users').get();
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.displayName || 'Sin nombre',
        email: data.email || '',
        role: data.role || 'user',
        createdAt: toDate(data.createdAt) || new Date(0),
        updatedAt: toDate(data.updatedAt),
        shopId: data.shopId,
      };
    });
    if (filters?.role) {
      const roleLower = filters.role.toLowerCase();
      users = users.filter(
        (u) =>
          (u.role || '').toLowerCase() === roleLower ||
          (roleLower === 'organizer' && (u.role || '').toLowerCase() === 'shop')
      );
    }
    const total = users.length;
    const paginated = users.slice(offset, offset + limit).map((u) => ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    }));
    return { data: paginated, total };
  },

  async getAllShops(limit: number, offset: number, filters?: { status?: string }) {
    let shopsQuery: Query = adminDb.collection('shops');
    if (filters?.status) {
      shopsQuery = shopsQuery.where('status', '==', filters.status);
    }
    const snapshot = await shopsQuery.get();
    const shopsWithUsers: any[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let userData = { id: data.userId || '', name: 'Sin nombre', email: '' };
      if (data.userId) {
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        if (userDoc.exists) {
          const u = userDoc.data() || {};
          userData = {
            id: userDoc.id,
            name: u.name || u.displayName || 'Sin nombre',
            email: u.email || '',
          };
        }
      }
      shopsWithUsers.push({
        id: doc.id,
        name: data.name || '',
        description: data.description,
        status: data.status || 'pending',
        createdAt: toDate(data.createdAt) || new Date(0),
        user: userData,
      });
    }
    shopsWithUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const total = shopsWithUsers.length;
    const paginated = shopsWithUsers.slice(offset, offset + limit).map((s) => ({
      ...s,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    }));
    return { data: paginated, total };
  },

  async getShopDetail(shopId: string) {
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) return null;
    const data = shopDoc.data() || {};
    let userData = { id: data.userId || '', name: 'Sin nombre', email: '' };
    if (data.userId) {
      const userDoc = await adminDb.collection('users').doc(data.userId).get();
      if (userDoc.exists) {
        const u = userDoc.data() || {};
        userData = {
          id: userDoc.id,
          name: u.name || u.displayName || 'Sin nombre',
          email: u.email || '',
        };
      }
    }
    const rafflesSnap = await adminDb.collection('raffles').where('shopId', '==', shopId).get();
    let totalRaffles = 0;
    let activeRaffles = 0;
    let finishedRaffles = 0;
    let cancelledRaffles = 0;
    rafflesSnap.docs.forEach((doc) => {
      const status = (doc.data().status || '').toLowerCase();
      totalRaffles += 1;
      if (status === 'active' || status === 'sold_out') activeRaffles++;
      else if (status === 'finished') finishedRaffles++;
      else if (status === 'cancelled') cancelledRaffles++;
    });
    return {
      id: shopDoc.id,
      name: data.name || '',
      description: data.description,
      status: data.status || 'pending',
      createdAt: toDate(data.createdAt)?.toISOString(),
      user: userData,
      stats: { totalRaffles, activeRaffles, finishedRaffles, cancelledRaffles },
    };
  },

  async changeShopStatus(shopId: string, newStatus: string, reason?: string) {
    const updateData: Record<string, any> = {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (reason) updateData.statusReason = reason;
    await adminDb.collection('shops').doc(shopId).update(updateData);
  },
};
