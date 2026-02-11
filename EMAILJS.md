# Configuración de EmailJS para envío de correos

Todos los correos transaccionales se envían con **EmailJS** (REST API desde el servidor).

## Flujos que envían correos al usuario

1. **Participación registrada** – Cuando el usuario sube el comprobante de pago
   - Mensaje: "Tu participación se ha registrado y está siendo validada"

2. **Ganador – Notificación con código** – Cuando se ejecuta la oportunidad y el usuario resulta ganador
   - Incluye: número de ticket ganador, código de verificación, datos del premio y del organizador

---

## Variables de entorno obligatorias

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | **Sí** | Public Key de tu cuenta EmailJS (Dashboard → Account → API Keys). |
| `EMAILJS_PRIVATE_KEY` | **Sí** (servidor) | Private Key de tu cuenta EmailJS. Sin ella, EmailJS devuelve 403 para llamadas desde el servidor. |
| `EMAILJS_SERVICE_ID` | No | Service ID del servicio de email (por defecto: `service_sovfqju`). |
| `NEXT_PUBLIC_APP_URL` | Sí (producción) | URL base de la app (ej. `https://www.tiketeaonline.com`). Necesaria para enlaces en los correos. |

## Variables para plantillas (recomendadas)

| Variable | Uso | Fallback |
|----------|-----|----------|
| `EMAILJS_TEMPLATE_PAYMENT_VALIDATION` | Participación registrada (usuario sube comprobante) | `template_mgmgrng` |
| `EMAILJS_TEMPLATE_WINNER_NOTIFICATION` | Notificación al ganador con código | `template_mgmgrng` |
| `EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED` | Oportunidad finalizada al organizador | `template_mgmgrng` |
| `EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE` | Pago realizado al organizador | `template_mgmgrng` |

---

## Pasos para habilitar los correos

### 1. Cuenta EmailJS

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/)
2. Conecta un servicio de email (Gmail, Outlook, etc.) en **Email Services**

### 2. Activar envío desde servidor

1. En **Account → Security**, activa **"Allow API requests from non-browser applications"**
2. En **Account → API Keys**, copia:
   - **Public Key** → `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
   - **Private Key** → `EMAILJS_PRIVATE_KEY` (solo en servidor, nunca en el frontend)

### 3. Plantillas en EmailJS

Ve a **[Templates](https://dashboard.emailjs.com/admin/templates)** y crea:

#### Plantilla: Participación registrada
- **ID** (cópialo exacto) → `EMAILJS_TEMPLATE_PAYMENT_VALIDATION`
- Variables sugeridas: `{{to_email}}`, `{{to_name}}`, `{{message}}`, `{{subject}}`

#### Plantilla: Notificación al ganador
- **ID** → `EMAILJS_TEMPLATE_WINNER_NOTIFICATION`
- Variables: `{{to_email}}`, `{{to_name}}`, `{{message}}`, `{{product_name}}`, `{{ticket_number}}`, `{{verification_code}}`, `{{raffle_url}}`, `{{shop_name}}`, `{{win_date}}`

Si usas la plantilla genérica `template_mgmgrng`, debe incluir al menos `{{message}}`, `{{to_email}}` y `{{to_name}}`.

### 4. Configurar `.env.local` (o variables en Vercel)

```env
# EmailJS (obligatorio para correos)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key
EMAILJS_PRIVATE_KEY=tu_private_key
EMAILJS_SERVICE_ID=service_sovfqju

# Plantillas (opcional; si no se definen, se usa template_mgmgrng)
EMAILJS_TEMPLATE_PAYMENT_VALIDATION=template_xxxxx
EMAILJS_TEMPLATE_WINNER_NOTIFICATION=template_yyyyy

# URL de la app (para enlaces en correos)
NEXT_PUBLIC_APP_URL=https://www.tiketeaonline.com
```

### 5. Verificación

- **Participación registrada**: sube un comprobante en checkout y revisa que llegue el correo.
- **Ganador**: ejecuta una oportunidad desde el panel admin y comprueba que el ganador reciba el correo con el código.

---

## Solución de problemas

| Error | Causa | Solución |
|-------|-------|----------|
| 403 Forbidden | Llamadas desde servidor bloqueadas | Activar "Allow API requests from non-browser applications" en EmailJS |
| "EMAILJS_PRIVATE_KEY no está configurado" | Falta la clave privada | Añadir `EMAILJS_PRIVATE_KEY` en `.env.local` |
| "The template ID not found" (400) | ID de plantilla incorrecto o inexistente | Crear la plantilla en EmailJS y copiar el ID exacto |
| No llegan correos | Plantilla sin `to_email` correcto | Verificar que la plantilla use `{{to_email}}` como destinatario |
