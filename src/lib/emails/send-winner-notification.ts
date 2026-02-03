import { sendEmail } from '@/lib/emailjs-server';

function getTemplateId(): string {
  const id = process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION?.trim();
  if (!id) {
    throw new Error(
      'EMAILJS_TEMPLATE_WINNER_NOTIFICATION no está configurado. Crea una plantilla en https://dashboard.emailjs.com/admin/templates y pon su ID en .env.local'
    );
  }
  return id;
}

export interface WinnerNotificationPayload {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle?: string;
  productName: string;
  productDescription?: string;
  productValue?: number;
  ticketNumber: number;
  verificationCode: string;
  shopName?: string;
  shopEmail?: string;
  shopPhone?: string;
  shopSocialMedia?: unknown;
  winDate: string;
}

/**
 * Envía el correo de notificación al ganador. Usado por la API POST y por resend-winner-email.
 */
export async function sendWinnerNotificationEmail(payload: WinnerNotificationPayload): Promise<string> {
  const templateId = getTemplateId();
  const formattedDate = new Date(payload.winDate).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const raffleUrl = `${appUrl}/sorteos/${payload.raffleId}/winner`;

  return sendEmail({
    templateId,
    templateParams: {
      to_email: payload.email,
      to_name: payload.name,
      raffle_title: payload.raffleTitle || payload.productName,
      product_name: payload.productName,
      product_description: payload.productDescription || 'Premio del sorteo',
      product_value: `S/. ${Number(payload.productValue ?? 0).toFixed(2)}`,
      ticket_number: String(payload.ticketNumber),
      verification_code: payload.verificationCode,
      shop_name: payload.shopName ?? '',
      shop_email: payload.shopEmail || 'No proporcionado',
      shop_phone: payload.shopPhone || 'No proporcionado',
      shop_social_media: typeof payload.shopSocialMedia === 'string' ? payload.shopSocialMedia : (payload.shopSocialMedia ? JSON.stringify(payload.shopSocialMedia) : 'No proporcionado'),
      win_date: formattedDate,
      raffle_url: raffleUrl,
    },
  });
}
