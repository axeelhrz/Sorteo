# Configuración de EmailJS para Notificaciones

## ✅ ESTADO: COMPLETAMENTE IMPLEMENTADO

Todas las notificaciones por email han sido implementadas usando EmailJS.

---

## 📧 CREDENCIALES DE EMAILJS

```
Service ID: service_sovfqju
Template ID: template_mgmgrng
Public Key: wp08DHZOgU6CgICb1
Private Key: D-OAmbtjdAa9zC5b7hu8x
```

---

## 🔧 CONFIGURACIÓN NECESARIA

### 1. Variables de Entorno

Agregar a tu archivo `.env.local`:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_sovfqju
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_mgmgrng
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=wp08DHZOgU6CgICb1

# Cron Job Security
CRON_SECRET=tu-secreto-seguro-aqui

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configuración en vercel.json

Agregar los cron jobs a tu `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-deliveries",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/send-delivery-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## 📨 ENDPOINTS DE EMAIL IMPLEMENTADOS

### 1. Notificación de Código Validado
**Ruta**: `POST /api/emails/send-winner-code-validated`

**Cuándo se envía**: Cuando el organizador valida el código del ganador

**Parámetros**:
```json
{
  "email": "ganador@example.com",
  "name": "Juan Pérez",
  "raffleTitle": "iPhone 15 Pro",
  "productName": "iPhone 15 Pro",
  "organizerName": "Tienda XYZ"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "..."
}
```

---

### 2. Notificación de Evidencia Subida
**Ruta**: `POST /api/emails/send-delivery-evidence-uploaded`

**Cuándo se envía**: Cuando el organizador sube evidencia de entrega

**Parámetros**:
```json
{
  "email": "ganador@example.com",
  "name": "Juan Pérez",
  "raffleTitle": "iPhone 15 Pro",
  "productName": "iPhone 15 Pro",
  "organizerName": "Tienda XYZ",
  "daysToConfirm": 7
}
```

---

### 3. Notificación de Entrega Confirmada
**Ruta**: `POST /api/emails/send-delivery-confirmed`

**Cuándo se envía**: Cuando el ganador confirma la recepción

**Parámetros**:
```json
{
  "email": "organizador@example.com",
  "name": "Tienda XYZ",
  "raffleTitle": "iPhone 15 Pro",
  "productName": "iPhone 15 Pro",
  "winnerName": "Juan Pérez"
}
```

---

### 4. Recordatorio de Expiración
**Ruta**: `POST /api/emails/send-delivery-reminder`

**Cuándo se envía**: Cuando faltan 2 días para expirar (automático vía cron)

**Parámetros**:
```json
{
  "email": "ganador@example.com",
  "name": "Juan Pérez",
  "raffleTitle": "iPhone 15 Pro",
  "productName": "iPhone 15 Pro",
  "daysRemaining": 2
}
```

---

## 🔄 FLUJO DE NOTIFICACIONES

```
1. SORTEO FINALIZA
   ↓
2. CORREO AL GANADOR (Notificación de ganador)
   ├─ Código único
   ├─ Datos del organizador
   └─ Instrucciones
   ↓
3. ORGANIZADOR VALIDA CÓDIGO
   ↓
4. CORREO AL GANADOR (Código validado) ✅
   ├─ Confirmación de validación
   ├─ Nombre del organizador
   └─ Instrucciones para esperar evidencia
   ↓
5. ORGANIZADOR SUBE EVIDENCIA
   ↓
6. CORREO AL GANADOR (Evidencia subida) ✅
   ├─ Notificación de evidencia
   ├─ Plazo de 7 días
   └─ Link al panel
   ↓
7. CRON JOB (Cada 10:00 UTC)
   ├─ Verifica entregas con 2 días restantes
   ↓
8. CORREO AL GANADOR (Recordatorio) ✅
   ├─ Urgencia: Faltan 2 días
   └─ Link para confirmar
   ↓
9. GANADOR CONFIRMA RECEPCIÓN
   ↓
10. CORREO AL ORGANIZADOR (Entrega confirmada) ✅
    ├─ Confirmación de recepción
    └─ Cierre del proceso
```

---

## 🔐 SEGURIDAD

### Validación de Requests
- Todos los endpoints validan campos requeridos
- Respuestas de error claras y específicas
- Logs detallados para debugging

### Cron Jobs
- Requieren `CRON_SECRET` en header Authorization
- Solo procesan sorteos en estado correcto
- Previenen duplicados (flags: reminderSent, etc.)

### EmailJS
- Credenciales almacenadas en variables de entorno
- Public key solo para cliente
- Private key solo para servidor

---

## 📊 ESTADÍSTICAS DE EMAILS

| Tipo | Destinatario | Frecuencia | Estado |
|------|-------------|-----------|--------|
| Código Validado | Ganador | 1 por sorteo | ✅ |
| Evidencia Subida | Ganador | 1 por sorteo | ✅ |
| Recordatorio | Ganador | 1 por sorteo (2 días) | ✅ |
| Entrega Confirmada | Organizador | 1 por sorteo | ✅ |

---

## 🧪 TESTING

### Test Manual de Validación de Código

```bash
curl -X POST http://localhost:3000/api/raffles/[raffleId]/validate-winner \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "XXXX-XXXX-XXXX"
  }'
```

### Test Manual de Confirmación

```bash
curl -X POST http://localhost:3000/api/raffles/[raffleId]/confirm-delivery \
  -H "Content-Type: application/json" \
  -d '{
    "confirmed": true,
    "userId": "user-id"
  }'
```

### Test de Cron Jobs

```bash
# Test check-deliveries
curl -X GET http://localhost:3000/api/cron/check-deliveries \
  -H "Authorization: Bearer tu-secreto-seguro"

# Test send-delivery-reminders
curl -X GET http://localhost:3000/api/cron/send-delivery-reminders \
  -H "Authorization: Bearer tu-secreto-seguro"
```

---

## 📝 LOGS Y DEBUGGING

### Logs Esperados

```
✅ Winner code validated email sent successfully
✅ Delivery confirmed email sent successfully
✅ Reminder sent for raffle: [raffleId]
✅ Auto-confirmed delivery for raffle: [raffleId]
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `EMAILJS_PUBLIC_KEY no está configurado` | Variable de entorno faltante | Agregar a .env.local |
| `Unauthorized` en cron | CRON_SECRET incorrecto | Verificar en vercel.json |
| `Error al enviar el correo` | Credenciales de EmailJS inválidas | Verificar Service ID y Template ID |

---

## 🚀 DEPLOYMENT

### En Vercel

1. Agregar variables de entorno en Vercel Dashboard:
   - `CRON_SECRET`
   - `NEXT_PUBLIC_APP_URL`

2. Actualizar `vercel.json` con cron jobs

3. Desplegar:
   ```bash
   git push origin main
   ```

### En Desarrollo Local

1. Crear `.env.local` con credenciales
2. Ejecutar servidor:
   ```bash
   npm run dev
   ```
3. Los cron jobs no se ejecutarán automáticamente (solo en Vercel)

---

## 📞 SOPORTE

### Verificar Configuración

1. **EmailJS Dashboard**: https://dashboard.emailjs.com
   - Verificar Service ID
   - Verificar Template ID
   - Verificar credenciales

2. **Vercel Dashboard**: https://vercel.com
   - Verificar variables de entorno
   - Verificar cron jobs
   - Ver logs de ejecución

3. **Logs Locales**:
   ```bash
   # Ver logs en desarrollo
   npm run dev
   # Buscar "✅" o "❌" en la consola
   ```

---

## ✨ CARACTERÍSTICAS

✅ **Notificaciones Automáticas**: En cada etapa del flujo
✅ **Recordatorios Inteligentes**: 2 días antes de expirar
✅ **Auto-Confirmación**: Después de 7 días
✅ **Seguridad**: Validaciones en cliente y servidor
✅ **Escalabilidad**: Cron jobs para múltiples entregas
✅ **Logging**: Registros detallados para debugging

---

## 📚 ARCHIVOS RELACIONADOS

- `src/app/api/emails/send-winner-code-validated/route.ts`
- `src/app/api/emails/send-delivery-evidence-uploaded/route.ts`
- `src/app/api/emails/send-delivery-confirmed/route.ts`
- `src/app/api/emails/send-delivery-reminder/route.ts`
- `src/app/api/cron/check-deliveries/route.ts`
- `src/app/api/cron/send-delivery-reminders/route.ts`
- `src/services/email-service.ts`
- `src/types/raffle.ts`

---

## 🎯 PRÓXIMOS PASOS

- [ ] Crear templates personalizados en EmailJS
- [ ] Agregar más idiomas (EN, PT)
- [ ] Implementar webhooks para tracking
- [ ] Dashboard de estadísticas de emails
- [ ] Pruebas automatizadas

---

**Última actualización**: 2024
**Versión**: 1.0
**Estado**: Producción