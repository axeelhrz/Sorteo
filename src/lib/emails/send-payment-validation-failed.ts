import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_PAYMENT_REJECTED ||
  process.env.EMAILJS_TEMPLATE_PAYMENT_VALIDATION ||
  'template_mgmgrng';

export interface PaymentValidationFailedPayload {
  email: string;
  name: string;
  ticketQuantity: number;
  amount: number;
  paymentMethod: string;
  reason: string;
  paymentId: string;
}

export async function sendPaymentValidationFailedEmail(
  payload: PaymentValidationFailedPayload
): Promise<string> {
  const { email, name, ticketQuantity, amount, paymentMethod, reason, paymentId } = payload;

  const messageBody =
    `Hola ${name},\n\n` +
    `Hemos recibido tu comprobante de pago, pero no pudimos validar automáticamente la información.\n\n` +
    `Motivo: ${reason}\n\n` +
    `Detalles de tu compra:\n` +
    `• Cantidad de tickets: ${ticketQuantity}\n` +
    `• Monto esperado: S/ ${Number(amount).toFixed(2)}\n` +
    `• Método de pago: ${paymentMethod}\n\n` +
    `Por favor, ponte en contacto con nuestro equipo de soporte:\n` +
    `Email: soporte@tiketea.com\n` +
    `WhatsApp: +51 984 908 819\n\n` +
    `ID de pago: ${paymentId}\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: 'Verificación de compra requerida - TIKETEA',
      message: messageBody,
      organizer_name: name,
      product_name: 'Verificación de compra',
      amount_paid: `S/ ${Number(amount).toFixed(2)}`,
    },
  });
}
