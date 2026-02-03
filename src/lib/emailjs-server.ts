/**
 * Envío de correos desde el servidor (API routes) usando EmailJS REST API.
 * EmailJS bloquea llamadas que no son desde el navegador (403) salvo que:
 * 1) En el dashboard: Account > Security > actives "Allow API requests from non-browser applications"
 * 2) Envíes la clave privada (accessToken) en cada request.
 * Variables: NEXT_PUBLIC_EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY (obligatorio en servidor), EMAILJS_SERVICE_ID.
 */

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const getConfig = () => {
  const userId = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_sovfqju';
  if (!userId) {
    throw new Error('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY no está configurado');
  }
  if (!privateKey || !privateKey.trim()) {
    throw new Error(
      'EMAILJS_PRIVATE_KEY no está configurado. Necesario para envío desde servidor. ' +
        'Obtén la clave privada en EmailJS > Account > API Keys y activa "Allow API requests from non-browser applications" en Security.'
    );
  }
  return { userId, serviceId, accessToken: privateKey.trim() };
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
  const { userId, serviceId, accessToken } = getConfig();
  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: sanitizeParams(templateParams),
    accessToken,
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
