/**
 * Envío de correos desde el servidor (API routes) usando EmailJS REST API.
 * Variables de entorno: NEXT_PUBLIC_EMAILJS_PUBLIC_KEY (obligatorio), EMAILJS_SERVICE_ID (opcional, default service_sovfqju).
 */

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const getConfig = () => {
  const userId = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_sovfqju';
  if (!userId) {
    throw new Error('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY no está configurado');
  }
  return { userId, serviceId };
};

export interface SendEmailOptions {
  templateId: string;
  /** Todas las claves deben ser strings para las plantillas EmailJS ({{variable_name}}) */
  templateParams: Record<string, string | number | undefined>;
}

function sanitizeParams(params: Record<string, string | number | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    out[k] = v === undefined || v === null ? '' : String(v);
  }
  return out;
}

/**
 * Envía un correo usando EmailJS (REST API).
 * @returns response text on success
 */
export async function sendEmail({ templateId, templateParams }: SendEmailOptions): Promise<string> {
  const { userId, serviceId } = getConfig();
  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: sanitizeParams(templateParams),
  };

  const res = await fetch(EMAILJS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS error ${res.status}: ${text || res.statusText}`);
  }

  return res.text();
}
