# Configuración de EmailJS para envío de correos

Todos los correos transaccionales se envían con **EmailJS** (REST API desde el servidor).

## Variables de entorno

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Sí | Public Key de tu cuenta EmailJS (Dashboard → Account → API Keys). |
| `EMAILJS_PRIVATE_KEY` | Sí (servidor) | Private Key de tu cuenta EmailJS (Dashboard → Account → API Keys). Necesaria para que las API routes puedan enviar correo; sin ella EmailJS devuelve 403 "API calls are disabled for non-browser applications". |
| `EMAILJS_SERVICE_ID` | No | Service ID del servicio de email en EmailJS (por defecto: `service_sovfqju`). |
| `EMAILJS_TEMPLATE_WINNER_NOTIFICATION` | No | Plantilla para notificación al ganador (por defecto: `template_winner_notification`). |
| `EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED` | No | Plantilla para “oportunidad finalizada” al organizador (por defecto: `template_mgmgrng`). |
| `EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE` | No | Plantilla para “pago realizado” al organizador (por defecto: `template_mgmgrng`). |

## Uso en el código

- **Servidor (API routes):** se usa `@/lib/emailjs-server` → `sendEmail({ templateId, templateParams })`, que llama a la REST API de EmailJS.
- Las rutas que envían correo son, entre otras:
  - `/api/emails/send-winner-notification` – notificación al ganador.
  - `/api/emails/send-organizer-raffle-finished` – oportunidad finalizada al organizador.
  - `/api/emails/send-organizer-payment-done` – pago realizado al organizador.

## Plantillas en EmailJS (obligatorio)

Si ves **"The template ID not found"** (400), es porque el ID que usas no existe en tu cuenta de EmailJS. Los IDs de `.env` deben ser **exactamente** los de plantillas que tú creas en EmailJS.

1. Entra en **[EmailJS → Templates](https://dashboard.emailjs.com/admin/templates)**.
2. **Crea una plantilla** (o usa una existente) y copia su **Template ID** (ej. `template_xxxxx`).
3. En tu `.env.local` define la variable con ese ID, por ejemplo:
   - Notificación al ganador: `EMAILJS_TEMPLATE_WINNER_NOTIFICATION=template_xxxxx` (el ID que te muestra EmailJS para esa plantilla).

En el dashboard debes tener también:

1. **Servicio de email** (Gmail, Outlook, etc.) conectado.
2. **Plantillas** con las variables que usa cada tipo de correo. Para la notificación al ganador, la plantilla puede usar por ejemplo: `{{to_email}}`, `{{to_name}}`, `{{raffle_title}}`, `{{product_name}}`, `{{ticket_number}}`, `{{verification_code}}`, `{{shop_name}}`, `{{win_date}}`, `{{raffle_url}}`.

## Habilitar envío desde el servidor

EmailJS bloquea por defecto las llamadas que no vienen del navegador (error 403). Para que funcione desde las API routes:

1. **Account → Security** → activa **"Allow API requests from non-browser applications"** (o equivalente para permitir Node.js/servidor).
2. Añade en `.env.local` la **Private Key**: `EMAILJS_PRIVATE_KEY=tu_clave_privada` (la obtienes en Account → API Keys; no la expongas en el frontend).
