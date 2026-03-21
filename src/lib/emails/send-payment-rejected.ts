import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_PAYMENT_REJECTED ||
  process.env.EMAILJS_TEMPLATE_PAYMENT_VALIDATION ||
  'template_mgmgrng';

export interface PaymentRejectedPayload {
  email: string;
  name: string;
  amount: number;
  ticketQuantity: number;
  paymentMethod: string;
  rejectionReason: string;
  paymentId: string;
}

export async function sendPaymentRejectedEmail(payload: PaymentRejectedPayload): Promise<string> {
  const { email, name, amount, ticketQuantity, paymentMethod, rejectionReason, paymentId } = payload;

  const messageBody =
    `Hola ${name},\n\n` +
    `Lamentamos informarte que tu pago ha sido rechazado por nuestro equipo de validación.\n\n` +
    `Motivo del rechazo: ${rejectionReason}\n\n` +
    `Detalles de la compra:\n` +
    `• Cantidad de tickets: ${ticketQuantity}\n` +
    `• Monto: S/ ${Number(amount).toFixed(2)}\n` +
    `• Método de pago: ${paymentMethod}\n\n` +
    `Si tienes dudas o deseas aclarar algo, contáctanos:\n` +
    `Email: soporte@tiketea.com\n` +
    `WhatsApp: +51 984 908 819\n\n` +
    `ID de pago: ${paymentId}\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: 'Pago rechazado - TIKETEA',
      message: messageBody,
      organizer_name: name,
      product_name: 'Pago rechazado',
      amount_paid: `S/ ${Number(amount).toFixed(2)}`,
    },
  });
}
