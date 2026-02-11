import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_PAYMENT_VALIDATION || process.env.EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE || 'template_mgmgrng';

export interface PaymentValidationPayload {
  email: string;
  name: string;
  ticketQuantity: number;
  amount: number;
  paymentMethod: string;
}

/**
 * Envía el correo de participación registrada al usuario (cuando sube el comprobante).
 * Usado por confirm-with-voucher y por la API /api/emails/send-payment-validation.
 */
export async function sendPaymentValidationEmail(payload: PaymentValidationPayload): Promise<string> {
  const { email, name, ticketQuantity, amount, paymentMethod } = payload;

  const messageBody =
    `Hola ${name},\n\n` +
    `Tu participación se ha registrado y está siendo validada por nuestro equipo.\n\n` +
    `Detalles de tu participación:\n` +
    `• Cantidad de tickets: ${ticketQuantity}\n` +
    `• Monto: S/ ${Number(amount).toFixed(2)}\n` +
    `• Método de pago: ${paymentMethod}\n\n` +
    `El proceso de validación puede tomar hasta 24 horas. Te enviaremos un correo de confirmación una vez que tu participación sea aprobada.\n\n` +
    `✓ Tu participación ha sido registrada correctamente.\n\n` +
    `Gracias por participar,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: name,
      subject: 'Participación en proceso de revisión - TIKETEA',
      message: messageBody,
      organizer_name: name,
      product_name: 'Participación registrada',
      amount_paid: `S/ ${Number(amount).toFixed(2)}`,
    },
  });
}
