import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_DELIVERY_EVIDENCE ||
  process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION ||
  'template_mgmgrng';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface DeliveryEvidenceUploadedPayload {
  email: string;
  name: string;
  raffleTitle: string;
  productName: string;
  organizerName: string;
  daysToConfirm?: number;
}

export async function sendDeliveryEvidenceUploadedEmail(
  payload: DeliveryEvidenceUploadedPayload
): Promise<string> {
  const { email, name, raffleTitle, productName, organizerName, daysToConfirm = 7 } = payload;

  const messageBody =
    `¡Excelente noticia! ${organizerName} ha subido la evidencia de entrega de tu premio.\n\n` +
    `Tienes ${daysToConfirm} días para confirmar la recepción en nuestra plataforma.\n` +
    `Si no confirmas en ese plazo, se dará por confirmada automáticamente.\n\n` +
    `Ver evidencia: ${APP_URL}/user-panel/won-raffles\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: `Evidencia de entrega disponible - ${raffleTitle}`,
      message: messageBody,
      raffle_title: raffleTitle,
      product_name: productName,
      organizer_name: organizerName,
      action_url: `${APP_URL}/user-panel/won-raffles`,
      action_text: 'Ver evidencia de entrega',
    },
  });
}
