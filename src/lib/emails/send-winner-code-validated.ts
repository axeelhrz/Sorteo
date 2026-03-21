import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_WINNER_CODE_VALIDATED ||
  process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION ||
  'template_mgmgrng';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface WinnerCodeValidatedPayload {
  email: string;
  name: string;
  raffleTitle: string;
  productName: string;
  organizerName: string;
}

export async function sendWinnerCodeValidatedEmail(
  payload: WinnerCodeValidatedPayload
): Promise<string> {
  const { email, name, raffleTitle, productName, organizerName } = payload;

  const messageBody =
    `Tu código de ganador ha sido validado exitosamente por ${organizerName}.\n\n` +
    `El organizador está preparando la entrega de tu premio.\n` +
    `Pronto recibirás la evidencia de entrega en tu panel.\n\n` +
    `Ver mis sorteos ganados: ${APP_URL}/user-panel/won-raffles\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: `Tu código ha sido validado - ${raffleTitle}`,
      message: messageBody,
      raffle_title: raffleTitle,
      product_name: productName,
      organizer_name: organizerName,
      action_url: `${APP_URL}/user-panel/won-raffles`,
      action_text: 'Ver mis sorteos ganados',
    },
  });
}
