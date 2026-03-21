import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_DELIVERY_REMINDER ||
  process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION ||
  'template_mgmgrng';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface DeliveryReminderPayload {
  email: string;
  name: string;
  raffleTitle: string;
  productName: string;
  daysRemaining?: number;
}

export async function sendDeliveryReminderEmail(payload: DeliveryReminderPayload): Promise<string> {
  const { email, name, raffleTitle, productName, daysRemaining = 2 } = payload;

  const messageBody =
    `¡RECORDATORIO IMPORTANTE! Te quedan ${daysRemaining} días para confirmar la recepción de tu premio.\n\n` +
    `Si no confirmas en ese plazo, se dará por confirmada automáticamente.\n` +
    `No olvides confirmar tu recepción en nuestra plataforma.\n\n` +
    `Confirmar recepción: ${APP_URL}/user-panel/won-raffles\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: `RECORDATORIO: Confirma la recepción de tu premio - ${raffleTitle}`,
      message: messageBody,
      raffle_title: raffleTitle,
      product_name: productName,
      days_remaining: String(daysRemaining),
      action_url: `${APP_URL}/user-panel/won-raffles`,
      action_text: 'Confirmar recepción ahora',
    },
  });
}
