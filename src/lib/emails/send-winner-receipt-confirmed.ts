import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_WINNER_RECEIPT_CONFIRMED ||
  process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION ||
  'template_mgmgrng';

export interface WinnerReceiptConfirmedPayload {
  email: string;
  name: string;
  raffleTitle: string;
  productName: string;
}

export async function sendWinnerReceiptConfirmedEmail(
  payload: WinnerReceiptConfirmedPayload
): Promise<string> {
  const { email, name, raffleTitle, productName } = payload;

  const messageBody =
    `Hola ${name},\n\n` +
    `Has confirmado la recepción de tu premio de la oportunidad ${productName} (${raffleTitle}).\n\n` +
    `✓ Recepción confirmada - El proceso de entrega ha quedado cerrado correctamente.\n\n` +
    `Gracias por participar,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: '¡Tu premio fue recibido! - TIKETEA',
      message: messageBody,
      organizer_name: name,
      product_name: productName,
    },
  });
}
