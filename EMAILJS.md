# Configuración de EmailJS para envío de correos

Todos los correos transaccionales se envían con **EmailJS** (REST API desde el servidor).

## Flujos que envían correos al usuario

1. **Participación registrada** – Cuando el usuario sube el comprobante de pago
   - Mensaje: "Tu participación se ha registrado y está siendo validada"

2. **Ganador – Notificación con código** – Cuando se ejecuta la oportunidad y el usuario resulta ganador
   - Incluye: número de ticket ganador, código de verificación, datos del premio y del organizador

3. **Organizador – Solicitud en revisión** – Cuando el organizador crea una oportunidad y la envía a aprobación (`/api/emails/send-opportunity-under-review`)
   - El asunto y el cuerpo en texto los genera la app con la marca **TIKETEA**; la “cáscara” visual (remitente, cabecera HTML) la define EmailJS.

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
| `EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW` | Organizador: solicitud de oportunidad registrada / en revisión | `template_mgmgrng` |
| `EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED` | Oportunidad finalizada al organizador | `template_mgmgrng` |
| `EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE` | Pago realizado al organizador | `template_mgmgrng` |

---

## Pasos para habilitar los correos

### 1. Cuenta EmailJS

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/)
2. Conecta un servicio de email (Gmail, Outlook, etc.) en **Email Services**

### 2. Nombre del remitente (From name)

Los correos que reciben los usuarios muestran el **nombre del remitente** configurado en EmailJS. Si aparece un nombre de prueba (por ejemplo "axeelhrz"), cámbialo así:

1. En **Email Services**: edita el servicio de correo conectado (Gmail, Outlook, etc.) y revisa el campo **From Name** (o equivalente). Pon el nombre que quieres que vean los usuarios (ej. **TIKETEA** o el nombre de tu negocio).
2. En **Templates**: algunas plantillas permiten definir un From name por plantilla. Revisa que no quede un valor de prueba y usa el mismo nombre profesional.

Así los destinatarios verán "TIKETEA" (o el nombre que configures) en lugar de un alias de desarrollo.

#### Alinear identidad TIKETEA (evitar otra marca en el correo al organizador)

Si el correo de **solicitud en revisión** al organizador muestra otra marca (por ejemplo en el remitente o en una cabecera HTML) pero el texto del mensaje habla de TIKETEA, el código de la app ya envía el copy correcto; debes ajustar **solo EmailJS**:

1. **Email Services** → edita el servicio indicado por `EMAILJS_SERVICE_ID` → **From Name**: usa **TIKETEA** o **TIKETEA ONLINE** (consistente con el resto de la plataforma).
2. **Templates** → abre la plantilla ligada a `EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW`, o la genérica `template_mgmgrng` si no definiste esa variable. En el HTML, elimina logos, títulos o pies con la marca antigua y sustitúyelos por TIKETEA, o deja el cuerpo basado en `{{message}}` sin marca fija incorrecta.
3. **Recomendación:** crea una **plantilla dedicada** para este flujo, copia su ID en `EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW` en `.env.local` / Vercel, así no compartes diseño con otras notificaciones que pudieran llevar branding heredado.

### 3. Activar envío desde servidor

1. En **Account → Security**, activa **"Allow API requests from non-browser applications"**
2. En **Account → API Keys**, copia:
   - **Public Key** → `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
   - **Private Key** → `EMAILJS_PRIVATE_KEY` (solo en servidor, nunca en el frontend)

### 4. Plantillas en EmailJS

Ve a **[Templates](https://dashboard.emailjs.com/admin/templates)** y crea:

#### Plantilla: Participación registrada
- **ID** (cópialo exacto) → `EMAILJS_TEMPLATE_PAYMENT_VALIDATION`
- Variables sugeridas: `{{to_email}}`, `{{to_name}}`, `{{message}}`, `{{subject}}`

#### Plantilla: Notificación al ganador
- **ID** → `EMAILJS_TEMPLATE_WINNER_NOTIFICATION`
- **To Email (destinatario):** debe ser exactamente **`{{to_email}}`**. Si pones un email fijo (o el de tu cuenta), el correo **solo llegará a ese email** y no al ganador.
- Variables en el cuerpo: `{{to_name}}`, `{{message}}`, `{{product_name}}`, `{{ticket_number}}`, `{{verification_code}}`, `{{raffle_url}}`, `{{shop_name}}`, `{{win_date}}`

Si usas la plantilla genérica `template_mgmgrng`, el campo **To Email** debe ser `{{to_email}}` y el cuerpo al menos `{{message}}`, `{{to_name}}`.

#### Plantilla: Organizador – solicitud en revisión
- **ID** → `EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW`
- **To Email:** `{{to_email}}`
- Variables útiles en el cuerpo: `{{to_name}}`, `{{subject}}`, `{{message}}`, `{{organizer_name}}`, `{{product_name}}`, `{{raffle_id}}`, `{{action_url}}`

### 5. Configurar `.env.local` (o variables en Vercel)

```env
# EmailJS (obligatorio para correos)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key
EMAILJS_PRIVATE_KEY=tu_private_key
EMAILJS_SERVICE_ID=service_sovfqju

# Plantillas (opcional; si no se definen, se usa template_mgmgrng)
EMAILJS_TEMPLATE_PAYMENT_VALIDATION=template_xxxxx
EMAILJS_TEMPLATE_WINNER_NOTIFICATION=template_yyyyy
EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW=template_zzzzz

# URL de la app (para enlaces en correos)
NEXT_PUBLIC_APP_URL=https://www.tiketeaonline.com
```

### 6. Verificación

- **Participación registrada**: sube un comprobante en checkout y revisa que llegue el correo.
- **Ganador**: ejecuta una oportunidad desde el panel admin y comprueba que el ganador reciba el correo con el código.
- **Organizador – solicitud en revisión**: crea una oportunidad desde el panel del organizador y comprueba que el remitente y la cabecera del correo muestren **TIKETEA**, no otra marca heredada en la plantilla.

---

## Solución de problemas

| Error | Causa | Solución |
|-------|-------|----------|
| 403 Forbidden | Llamadas desde servidor bloqueadas | Activar "Allow API requests from non-browser applications" en EmailJS |
| "EMAILJS_PRIVATE_KEY no está configurado" | Falta la clave privada | Añadir `EMAILJS_PRIVATE_KEY` en `.env.local` |
| "The template ID not found" (400) | ID de plantilla incorrecto o inexistente | Crear la plantilla en EmailJS y copiar el ID exacto |
| No llegan correos | Plantilla sin `to_email` correcto | Verificar que la plantilla use `{{to_email}}` como destinatario |
| El correo solo llega al email de EmailJS / a un solo correo | En la plantilla, "To Email" está fijo (ej. tu correo de prueba) | En EmailJS → Templates → tu plantilla de ganador → **To Email** debe ser exactamente `{{to_email}}` (sin comillas ni otro texto). Así el envío irá al correo real del ganador. |
| El remitente muestra un nombre de prueba (ej. "axeelhrz") | From name configurado con un alias de desarrollo en EmailJS | En EmailJS → Email Services (y/o Templates), cambia el **From Name** al nombre que deben ver los usuarios (ej. TIKETEA). |
| El correo muestra otra marca en remitente o cabecera HTML (ej. FIDELYA) pero el texto del cuerpo menciona TIKETEA | El copy lo envía la API con TIKETEA; la identidad visible viene del **servicio** y del **HTML de la plantilla** en EmailJS | Revisa **From Name** del servicio (`EMAILJS_SERVICE_ID`) y el HTML de la plantilla usada para `EMAILJS_TEMPLATE_OPPORTUNITY_UNDER_REVIEW` (o `template_mgmgrng` si aplica). Considera una plantilla dedicada para este flujo. |
