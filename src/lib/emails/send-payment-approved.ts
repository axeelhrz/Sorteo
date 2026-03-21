import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_PAYMENT_APPROVED ||
  process.env.EMAILJS_TEMPLATE_PAYMENT_VALIDATION ||
  'template_mgmgrng';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface PaymentApprovedPayload {
  email: string;
  name: string;
  raffleName: string;
  ticketQuantity: number;
  amount: number;
  paymentMethod: string;
}

export async function sendPaymentApprovedEmail(payload: PaymentApprovedPayload): Promise<string> {
  const { email, name, raffleName, ticketQuantity, amount, paymentMethod } = payload;

  const messageBody =
    `Hola ${name},\n\n` +
    `¡Excelentes noticias! Tu pago ha sido verificado y aprobado. Tus tickets ya están asignados.\n\n` +
    `Detalles de tu compra:\n` +
    `• Sorteo: ${raffleName}\n` +
    `• Cantidad de tickets: ${ticketQuantity}\n` +
    `• Monto pagado: S/ ${Number(amount).toFixed(2)}\n` +
    `• Método de pago: ${paymentMethod}\n\n` +
    `Puedes ver tus tickets en tu panel de usuario: ${APP_URL}/user-panel/participations\n\n` +
    `¡Mucha suerte en el sorteo!\n\n` +
    `Saludos,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: '¡Pago confirmado exitosamente! - TIKETEA',
      message: messageBody,
      organizer_name: name,
      product_name: raffleName,
      amount_paid: `S/ ${Number(amount).toFixed(2)}`,
    },
  });
}
