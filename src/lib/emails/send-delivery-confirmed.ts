import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_DELIVERY_CONFIRMED ||
  process.env.EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED ||
  'template_mgmgrng';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface DeliveryConfirmedPayload {
  email: string;
  name: string;
  raffleTitle: string;
  productName: string;
  winnerName: string;
}

export async function sendDeliveryConfirmedEmail(payload: DeliveryConfirmedPayload): Promise<string> {
  const { email, name, raffleTitle, productName, winnerName } = payload;

  const messageBody =
    `¡Excelente! ${winnerName} ha confirmado la recepción de su premio.\n\n` +
    `El proceso de entrega para el sorteo "${raffleTitle}" ha sido completado exitosamente.\n\n` +
    `Ver mis sorteos: ${APP_URL}/dashboard/store\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: `Entrega confirmada - ${raffleTitle}`,
      message: messageBody,
      raffle_title: raffleTitle,
      product_name: productName,
      winner_name: winnerName,
      action_url: `${APP_URL}/dashboard/store`,
      action_text: 'Ver mis sorteos',
    },
  });
}
