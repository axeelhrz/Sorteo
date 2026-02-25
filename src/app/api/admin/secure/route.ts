import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSessionCookie,
  verifyAdminSessionToken,
  clearAdminSessionCookie,
} from '@/lib/admin-session';
import { adminSecureService } from '@/server/admin-secure-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = getAdminSessionCookie(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyAdminSessionToken(token);
    if (!payload) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Set-Cookie', clearAdminSessionCookie());
      return response;
    }

    const body = await request.json();
    const action = body.action as string;
    const params = body.payload || {};

    let data;

    switch (action) {
      case 'getDashboardStats':
        data = await adminSecureService.getDashboardStats();
        break;
      case 'getPendingPayments':
        data = await adminSecureService.getPendingPayments();
        break;
      case 'getPayments':
        data = await adminSecureService.getPayments(params);
        break;
      case 'approvePaymentAndAssignTickets':
        data = await adminSecureService.approvePaymentAndAssignTickets(
          params.paymentId,
          payload.userId
        );
        break;
      case 'getUserData':
        data = await adminSecureService.getUserData(params.userId);
        break;
      case 'getRaffleData':
        data = await adminSecureService.getRaffleData(params.raffleId);
        break;
      case 'getPendingRaffles':
        data = await adminSecureService.getPendingRaffles(
          params.limit,
          params.offset,
          params.shopId
        );
        break;
      case 'approveRaffle':
        data = await adminSecureService.approveRaffle(params.raffleId, params);
        break;
      case 'rejectRaffle':
        data = await adminSecureService.rejectRaffle(params.raffleId, params.reason);
        break;
      case 'getActiveRaffles':
        data = await adminSecureService.getActiveRaffles(
          params.limit,
          params.offset,
          params.shopId
        );
        break;
      case 'cancelRaffle':
        data = await adminSecureService.cancelRaffle(params.raffleId, params.reason);
        break;
      case 'getFinishedRaffles':
        data = await adminSecureService.getFinishedRaffles(
          params.limit,
          params.offset,
          params.shopId
        );
        break;
      case 'getPaymentHistory':
        data = await adminSecureService.getPaymentHistory(params.filters);
        break;
      case 'getAllUsers':
        data = await adminSecureService.getAllUsers(params.limit, params.offset, params.filters);
        break;
      case 'getAllShops':
        data = await adminSecureService.getAllShops(params.limit, params.offset, params.filters);
        break;
      case 'getShopDetail':
        data = await adminSecureService.getShopDetail(params.shopId);
        break;
      case 'changeShopStatus':
        data = await adminSecureService.changeShopStatus(
          params.shopId,
          params.newStatus,
          params.reason
        );
        break;
      default:
        return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('admin/secure error:', error);
    return NextResponse.json(
      { error: error.message || 'Error en operación admin' },
      { status: 500 }
    );
  }
}
