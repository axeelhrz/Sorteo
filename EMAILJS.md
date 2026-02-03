# Configuración de EmailJS para envío de correos

Todos los correos transaccionales se envían con **EmailJS** (REST API desde el servidor).

## Variables de entorno

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Sí | Public Key de tu cuenta EmailJS (Dashboard → Account → API Keys). |
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

## Plantillas en EmailJS

En [EmailJS Dashboard](https://dashboard.emailjs.com/) debes tener:

1. **Servicio de email** (Gmail, Outlook, etc.) conectado.
2. **Plantillas** con las variables que usa cada tipo de correo (por ejemplo `to_email`, `to_name`, `subject`, `message`, `action_url`, `action_text` para la plantilla genérica `template_mgmgrng`).

Para “organizer raffle finished” y “organizer payment done” se usa por defecto la misma plantilla genérica (`template_mgmgrng`) con `subject`, `message`, `action_url`, `action_text`. Si creas plantillas propias, define los IDs en las variables de entorno anteriores.

## Habilitar envío desde el servidor

En EmailJS: **Account → Security** → activa **Allow server-side (Node.js)** para que la REST API funcione desde las API routes.
