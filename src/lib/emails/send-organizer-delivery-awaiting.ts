import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_ORGANIZER_DELIVERY ||
  process.env.EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED ||
  'template_mgmgrng';

export interface OrganizerDeliveryAwaitingPayload {
  email: string;
  organizerName: string;
  raffleId: string;
  productName: string;
}

export async function sendOrganizerDeliveryAwaitingEmail(
  payload: OrganizerDeliveryAwaitingPayload
): Promise<string> {
  const { email, organizerName, raffleId, productName } = payload;

  const messageBody =
    `Hola ${organizerName},\n\n` +
    `Has subido la evidencia de entrega para la oportunidad ${productName} (ID: ${raffleId}).\n\n` +
    `El proceso está a la espera de la confirmación de recepción del ganador.\n` +
    `El ganador tiene 7 días para confirmar en la web que recibió el premio. ` +
    `Si no confirma en ese plazo, se dará por confirmada con la evidencia que subiste.\n\n` +
    `Gracias,\nEquipo TIKETEA`;

  return sendEmail({
    templateId: TEMPLATE_ID,
    templateParams: {
      to_email: email,
      to_name: organizerName,
      subject: 'Evidencia de entrega registrada - TIKETEA',
      message: messageBody,
      organizer_name: organizerName,
      product_name: productName,
    },
  });
}
