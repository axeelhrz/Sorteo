# Sistema de Validación de Pagos con OCR

## 📋 Resumen Ejecutivo

Sistema completo de validación automática de pagos mediante OCR (Reconocimiento Óptico de Caracteres) con notificaciones por correo electrónico y panel de administración para aprobación manual.

**Estado:** ✅ Implementado (Requiere integración de OCR real)

---

## 🎯 Flujo Completo del Sistema

```
1. Usuario sube comprobante de pago
   ↓
2. Sistema procesa imagen con OCR
   ↓
3. OCR extrae monto del comprobante
   ↓
4. Sistema valida monto vs. monto esperado
   ↓
5a. ✅ Validación exitosa
    → Envía correo: "Tu compra está siendo validada"
    → Estado: pending_validation
    → Espera aprobación del admin
    
5b. ❌ Validación fallida
    → Envía correo: "No se pudo validar tu compra"
    → Incluye datos de soporte
    → Estado: pending_validation (requiere revisión manual)
    ↓
6. Admin revisa y aprueba/rechaza
   ↓
7a. ✅ Admin aprueba
    → Asigna tickets al usuario
    → Envía correo: "¡Tu compra ha sido confirmada!"
    → Estado: completed
    
7b. ❌ Admin rechaza
    → Envía correo con motivo del rechazo
    → Estado: failed
```

---

## 🔧 Componentes Implementados

### 1. **Servicio OCR** (`ocr-service.ts`)

**Funciones principales:**
- `processVoucher(imageUrl)` - Procesa imagen y extrae texto
- `validatePaymentAmount(extracted, expected)` - Valida montos
- `processAndValidate(imageUrl, expectedAmount)` - Proceso completo

**Características:**
- ✅ Extracción de monto del comprobante
- ✅ Validación con tolerancia del 1%
- ✅ Nivel de confianza del OCR
- ✅ Mensajes de error descriptivos

**Nota:** Actualmente es una implementación mock. Requiere integración con:
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision
- Tesseract.js

### 2. **Servicio de Pagos** (`firebase-payment-service.ts`)

**Nuevos métodos:**
- `getPendingValidationPayments()` - Obtiene pagos pendientes
- `approvePayment(paymentId, adminId)` - Aprueba pago
- `rejectPayment(paymentId, adminId, reason)` - Rechaza pago
- `updateOCRValidation(paymentId, ocrResult)` - Actualiza resultado OCR

**Campos agregados a Payment:**
- `ocrProcessed` - Si el OCR ya procesó el comprobante
- `ocrExtractedAmount` - Monto extraído por OCR
- `ocrConfidence` - Nivel de confianza del OCR
- `ocrValid` - Si la validación OCR fue exitosa
- `ocrMessage` - Mensaje del resultado OCR
- `ocrProcessedAt` - Fecha de procesamiento OCR
- `approvedBy` - ID del admin que aprobó
- `rejectedBy` - ID del admin que rechazó

### 3. **Servicio de Administración** (`admin-service.ts`)

**Funciones principales:**
- `processPaymentWithOCR(payment)` - Procesa pago con OCR
- `sendValidationInProgressEmail(payment)` - Correo de validación en proceso
- `sendValidationFailedEmail(payment, reason)` - Correo de validación fallida
- `sendPaymentApprovedEmail(payment)` - Correo de aprobación
- `approvePaymentAndAssignTickets(paymentId, adminId)` - Aprueba y asigna tickets
- `getPendingPayments()` - Obtiene pagos pendientes

### 4. **Servicio de Correos** (`email-service.ts`)

**Nuevos métodos:**
- `sendPaymentValidationEmail(data)` - Correo de validación en proceso
- `sendPaymentValidationFailedEmail(data)` - Correo de validación fallida
- `sendPaymentApprovedEmail(data)` - Correo de aprobación

---

## 📧 Correos Electrónicos

### 1. **Validación en Proceso** (OCR exitoso)

**Asunto:** Tu compra está siendo validada - TIKETEA

**Contenido:**
- ✅ Confirmación de recepción del comprobante
- 📊 Detalles de la compra (tickets, monto, método)
- ⏱️ Tiempo estimado de validación (24 horas)
- ✓ Indicador de validación automática exitosa

### 2. **Validación Fallida** (OCR fallido)

**Asunto:** Necesitamos verificar tu compra - TIKETEA

**Contenido:**
- ⚠️ Notificación de problema en validación
- 📝 Motivo específico del fallo
- 📊 Detalles de la compra esperada
- 📞 Datos de soporte completos:
  - Email: soporte@tiketea.com
  - WhatsApp: +51 984 908 819
  - Horario: Lunes a Viernes, 9:00 AM - 6:00 PM
- 🆔 ID de pago para referencia

### 3. **Pago Aprobado** (Admin aprueba)

**Asunto:** ¡Tu compra ha sido confirmada! - TIKETEA

**Contenido:**
- ✅ Confirmación de aprobación
- 🎟️ Notificación de asignación de tickets
- 📊 Detalles completos de la compra
- 🔗 Enlace directo a "Mis Participaciones"
- 🍀 Mensaje de buena suerte

---

## 🔐 Estados de Pago

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `pending` | Pago creado, esperando comprobante | Usuario: Subir comprobante |
| `pending_validation` | Comprobante subido, en validación | Admin: Aprobar/Rechazar |
| `completed` | Pago aprobado, tickets asignados | Ninguna |
| `failed` | Pago rechazado | Usuario: Contactar soporte |
| `refunded` | Pago reembolsado | Ninguna |

---

## 🎨 Panel de Administración (Pendiente)

### Funcionalidades Requeridas:

**Vista de Pagos Pendientes:**
- ✅ Lista de pagos en `pending_validation`
- ✅ Filtros por fecha, monto, método
- ✅ Búsqueda por ID de pago o usuario
- ✅ Ordenamiento por fecha de subida

**Detalle de Pago:**
- ✅ Información del usuario
- ✅ Detalles del sorteo
- ✅ Monto esperado vs. monto extraído (OCR)
- ✅ Nivel de confianza del OCR
- ✅ Visualización del comprobante (zoom, descarga)
- ✅ Historial de acciones

**Acciones del Admin:**
- ✅ Aprobar pago → Asigna tickets + Envía correo
- ✅ Rechazar pago → Solicita motivo + Envía correo
- ✅ Solicitar nuevo comprobante
- ✅ Agregar notas internas

---

## 🔧 Integración de OCR Real

### Opciones Recomendadas:

#### 1. **Google Cloud Vision API** (Recomendado)

**Ventajas:**
- Alta precisión en español
- Reconocimiento de texto en imágenes
- Detección de montos y fechas
- Pricing competitivo

**Instalación:**
```bash
npm install @google-cloud/vision
```

**Configuración:**
```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'path/to/service-account-key.json'
});

async function detectText(imageUrl: string) {
  const [result] = await client.textDetection(imageUrl);
  const detections = result.textAnnotations;
  return detections[0]?.description || '';
}
```

#### 2. **AWS Textract**

**Ventajas:**
- Extracción de datos estructurados
- Análisis de documentos financieros
- Integración con AWS ecosystem

**Instalación:**
```bash
npm install @aws-sdk/client-textract
```

#### 3. **Tesseract.js** (Cliente)

**Ventajas:**
- Procesamiento en el navegador
- Sin costos de API
- Privacidad de datos

**Instalación:**
```bash
npm install tesseract.js
```

**Desventajas:**
- Menor precisión
- Requiere más recursos del cliente

---

## 📊 Datos Almacenados

### Colección: `payments`

```typescript
{
  id: string;
  raffleId: string;
  userId: string;
  amount: number;
  ticketQuantity: number;
  status: 'pending' | 'pending_validation' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'yape' | 'plin' | 'dale';
  voucherUrl: string;
  
  // Campos OCR
  ocrProcessed: boolean;
  ocrExtractedAmount?: number;
  ocrConfidence?: number;
  ocrValid: boolean;
  ocrMessage: string;
  ocrProcessedAt?: Date;
  
  // Campos de aprobación
  approvedBy?: string;
  rejectedBy?: string;
  failureReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  voucherUploadedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}
```

---

## 🚀 Próximos Pasos

### Implementación Inmediata:

1. **Integrar OCR Real**
   - [ ] Elegir proveedor (Google Cloud Vision recomendado)
   - [ ] Configurar credenciales
   - [ ] Implementar extracción de montos
   - [ ] Probar con comprobantes reales

2. **Crear Panel de Admin**
   - [ ] Página de pagos pendientes
   - [ ] Vista de detalle de pago
   - [ ] Botones de aprobar/rechazar
   - [ ] Visualizador de comprobantes

3. **Implementar Asignación de Tickets**
   - [ ] Crear función en raffle-service
   - [ ] Generar números de ticket únicos
   - [ ] Actualizar contador de tickets vendidos
   - [ ] Registrar en historial del usuario

4. **Configurar Endpoints de Email**
   - [ ] `/api/emails/send-payment-validation`
   - [ ] `/api/emails/send-payment-validation-failed`
   - [ ] `/api/emails/send-payment-approved`

5. **Testing Completo**
   - [ ] Flujo completo con OCR
   - [ ] Validación exitosa
   - [ ] Validación fallida
   - [ ] Aprobación manual
   - [ ] Rechazo manual
   - [ ] Envío de correos

---

## 🧪 Casos de Prueba

### Escenario 1: Validación OCR Exitosa
1. Usuario sube comprobante con monto correcto
2. OCR extrae monto correctamente
3. Sistema valida monto (coincide)
4. Usuario recibe correo de validación en proceso
5. Admin aprueba pago
6. Tickets se asignan
7. Usuario recibe correo de confirmación

### Escenario 2: Validación OCR Fallida
1. Usuario sube comprobante con monto incorrecto/ilegible
2. OCR no puede extraer monto o extrae monto diferente
3. Sistema detecta discrepancia
4. Usuario recibe correo con datos de soporte
5. Usuario contacta soporte
6. Admin revisa manualmente
7. Admin aprueba/rechaza según corresponda

### Escenario 3: Rechazo de Pago
1. Admin revisa pago pendiente
2. Detecta problema (monto incorrecto, comprobante falso, etc.)
3. Admin rechaza con motivo
4. Usuario recibe correo de rechazo
5. Estado cambia a `failed`

---

## 📞 Información de Soporte

**Email:** soporte@tiketea.com  
**WhatsApp:** +51 984 908 819  
**Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

---

## 📝 Notas Importantes

1. **OCR Mock:** La implementación actual usa un OCR simulado. Debe integrarse un servicio real antes de producción.

2. **Emails Placeholder:** Los correos usan emails de ejemplo (`user@example.com`). Debe obtenerse el email real del usuario desde Firebase Auth.

3. **Asignación de Tickets:** La función de asignación de tickets está pendiente de implementación en el servicio de sorteos.

4. **Panel de Admin:** El panel de administración de pagos está pendiente de desarrollo.

5. **Tolerancia OCR:** Actualmente configurada en 1%. Puede ajustarse según necesidad.

6. **Procesamiento Asíncrono:** El OCR debe ejecutarse de forma asíncrona para no bloquear la respuesta al usuario.

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** 🟡 Implementación parcial (Requiere OCR real y panel admin)