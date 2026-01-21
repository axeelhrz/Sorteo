# Flujo de Verificación del Ganador

Este documento describe el flujo completo de verificación y entrega del premio al ganador de un sorteo.

## 📋 Resumen del Flujo

1. **Sorteo finalizado** → Se selecciona un ganador
2. **Generación de código único** → Se crea un código de verificación
3. **Notificación al ganador** → Se envía correo con toda la información
4. **Contacto ganador-organizador** → El ganador contacta al organizador
5. **Validación del código** → El organizador valida el código en la web
6. **Entrega del premio** → El organizador entrega el premio
7. **Subida de evidencia** → El organizador sube foto de la entrega
8. **Confirmación del ganador** → El ganador confirma recepción (7 días)
9. **Cierre del flujo** → El proceso se completa

---

## 🔄 Flujo Detallado

### 1. Finalización del Sorteo y Selección del Ganador

Cuando un sorteo se completa (todos los tickets vendidos o fecha límite alcanzada), el sistema:

- Selecciona aleatoriamente un ticket ganador
- Genera un código único de verificación (formato: XXXX-XXXX-XXXX)
- Actualiza el sorteo con la información del ganador:

```typescript
{
  winnerInfo: {
    userId: string,
    ticketId: string,
    ticketNumber: number,
    verificationCode: string,
    notifiedAt: Date,
    deliveryStatus: 'pending',
  }
}
```

**Código de ejemplo:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';
import { emailService } from '@/services/email-service';

// Generar código único
const verificationCode = winnerVerificationService.generateVerificationCode();
// Resultado: "A3F9-K2L7-M4N8"

// Actualizar sorteo con información del ganador
await updateDoc(raffleRef, {
  winnerInfo: {
    userId: winner.userId,
    ticketId: winner.ticketId,
    ticketNumber: winner.ticketNumber,
    verificationCode: verificationCode,
    notifiedAt: serverTimestamp(),
    deliveryStatus: 'pending',
  }
});
```

---

### 2. Envío de Correo al Ganador

El ganador recibe un correo electrónico con:

#### Información del Premio:
- ID del sorteo
- Nombre del producto
- Descripción del producto
- Valor del producto
- Número del ticket ganador
- Fecha del sorteo

#### Código Único de Ganador:
- Código de verificación en formato destacado
- Instrucciones para guardarlo

#### Datos del Organizador:
- Nombre del organizador
- Correo electrónico
- Teléfono
- Redes sociales (Facebook, Instagram, WhatsApp, Twitter)

#### Instrucciones:
1. Contactar al organizador
2. Proporcionar el código único
3. Coordinar la entrega
4. Confirmar recepción en la plataforma

**Código de ejemplo:**

```typescript
import { emailService } from '@/services/email-service';

await emailService.sendWinnerNotificationEmail({
  email: winner.email,
  name: winner.name,
  raffleId: raffle.id,
  raffleTitle: raffle.product.name,
  productName: raffle.product.name,
  productDescription: raffle.product.description,
  productValue: raffle.productValue,
  ticketNumber: winner.ticketNumber,
  verificationCode: verificationCode,
  shopName: raffle.shop.name,
  shopEmail: raffle.shop.publicEmail,
  shopPhone: raffle.shop.phone,
  shopSocialMedia: raffle.shop.socialMedia,
  winDate: new Date(),
});
```

---

### 3. Contacto del Ganador con el Organizador

El ganador debe:

1. **Revisar su correo electrónico** y guardar el código de verificación
2. **Contactar al organizador** usando los datos proporcionados:
   - Email
   - Teléfono
   - WhatsApp
   - Redes sociales
3. **Identificarse** como el ganador del sorteo
4. **Proporcionar el código único** al organizador
5. **Coordinar** fecha, hora y lugar de entrega

---

### 4. Validación del Código por el Organizador

El organizador ingresa el código en la plataforma web para validar al ganador.

**Interfaz de validación:**

```typescript
// Componente de validación (ejemplo)
<form onSubmit={handleValidateCode}>
  <input
    type="text"
    placeholder="Ingresa el código (XXXX-XXXX-XXXX)"
    value={code}
    onChange={(e) => setCode(e.target.value)}
  />
  <button type="submit">Validar Ganador</button>
</form>
```

**Lógica de validación:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';

const handleValidateCode = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const result = await winnerVerificationService.validateWinnerCode({
      raffleId: raffleId,
      verificationCode: code,
    });
    
    if (result.valid) {
      alert('✅ Código válido. Ganador verificado correctamente.');
      // Mostrar información del ganador
      setWinnerInfo(result.winnerInfo);
      // Actualizar estado a 'contacted'
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    alert('Error al validar el código');
  }
};
```

**Estados de validación:**

- ✅ **Código válido**: El ganador es legítimo, se actualiza el estado a `contacted`
- ❌ **Código inválido**: El código no coincide
- ⚠️ **Sin ganador**: El sorteo no tiene un ganador asignado
- 🔍 **Sorteo no encontrado**: El ID del sorteo es incorrecto

---

### 5. Entrega del Premio

El organizador:

1. **Coordina** con el ganador la entrega del premio
2. **Entrega** el premio físicamente o por envío
3. **Toma fotografías** de la entrega como evidencia
4. **Actualiza** el estado en la plataforma

**Actualización de estado:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';

// Actualizar estado a 'in_delivery'
await winnerVerificationService.updateDeliveryStatus(
  raffleId,
  'in_delivery'
);
```

---

### 6. Subida de Evidencia de Entrega

El organizador sube evidencia de la entrega del premio:

**Formulario de evidencia:**

```typescript
<form onSubmit={handleUploadEvidence}>
  <div>
    <label>Foto de la entrega *</label>
    <input
      type="file"
      accept="image/*"
      onChange={handlePhotoUpload}
      required
    />
  </div>
  
  <div>
    <label>Fotos adicionales (opcional)</label>
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleAdditionalPhotos}
    />
  </div>
  
  <div>
    <label>Notas (opcional)</label>
    <textarea
      placeholder="Detalles sobre la entrega..."
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>
  
  <button type="submit">Subir Evidencia</button>
</form>
```

**Lógica de subida:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';
import { uploadService } from '@/services/upload-service';

const handleUploadEvidence = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. Subir foto principal
    const photoUrl = await uploadService.uploadImage(mainPhoto, 'delivery-evidence');
    
    // 2. Subir fotos adicionales (si existen)
    const additionalPhotos = [];
    for (const photo of additionalPhotoFiles) {
      const url = await uploadService.uploadImage(photo, 'delivery-evidence');
      additionalPhotos.push(url);
    }
    
    // 3. Guardar evidencia en Firestore
    await winnerVerificationService.uploadDeliveryEvidence(
      {
        raffleId: raffleId,
        photoUrl: photoUrl,
        notes: notes,
        additionalPhotos: additionalPhotos,
      },
      currentUser.id
    );
    
    alert('✅ Evidencia subida correctamente');
    
    // 4. Se establece fecha límite de 7 días para confirmación
  } catch (error) {
    alert('Error al subir la evidencia');
  }
};
```

**Resultado:**

- Estado del sorteo se actualiza a `delivered`
- Se establece una fecha límite de **7 días** para que el ganador confirme
- El ganador puede ver la evidencia en su panel

---

### 7. Confirmación de Recepción por el Ganador

El ganador tiene **7 días** para confirmar la recepción del premio.

**Interfaz de confirmación:**

```typescript
<div className="delivery-confirmation">
  <h3>Confirmar Recepción del Premio</h3>
  
  {winnerInfo.deliveryEvidence && (
    <div className="evidence">
      <img src={winnerInfo.deliveryEvidence.photoUrl} alt="Evidencia de entrega" />
      {winnerInfo.deliveryEvidence.notes && (
        <p>{winnerInfo.deliveryEvidence.notes}</p>
      )}
    </div>
  )}
  
  <p>
    ¿Has recibido tu premio correctamente?
  </p>
  
  <div className="deadline-warning">
    ⏰ Tienes hasta el {formatDate(winnerInfo.deliveryDeadline)} para confirmar.
    Si no confirmas, se dará por confirmada automáticamente.
  </div>
  
  <button onClick={handleConfirmDelivery}>
    ✅ Confirmar Recepción
  </button>
  
  <button onClick={handleOpenComplaint}>
    📋 Reportar Problema
  </button>
</div>
```

**Lógica de confirmación:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';

const handleConfirmDelivery = async () => {
  try {
    await winnerVerificationService.confirmDelivery(
      {
        raffleId: raffleId,
        confirmed: true,
      },
      currentUser.id
    );
    
    alert('✅ Recepción confirmada. ¡Gracias por participar!');
    // Estado se actualiza a 'confirmed'
  } catch (error) {
    alert('Error al confirmar la recepción');
  }
};
```

---

### 8. Auto-confirmación después de 7 días

Si el ganador no confirma en 7 días, el sistema confirma automáticamente.

**Verificación automática:**

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';

// Esta función se puede ejecutar mediante un cron job o al cargar la página
const checkAutoConfirm = async (raffleId: string) => {
  const autoConfirmed = await winnerVerificationService.checkAndAutoConfirmDelivery(raffleId);
  
  if (autoConfirmed) {
    console.log('✅ Entrega confirmada automáticamente por vencimiento del plazo');
  }
};
```

**Cron job recomendado:**

```typescript
// Ejecutar diariamente para verificar sorteos pendientes
// Firebase Cloud Functions o similar

export const checkPendingDeliveries = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const rafflesRef = collection(db, 'raffles');
    const q = query(
      rafflesRef,
      where('winnerInfo.deliveryStatus', '==', 'delivered')
    );
    
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      await winnerVerificationService.checkAndAutoConfirmDelivery(doc.id);
    }
  });
```

---

## 📊 Estados del Flujo de Entrega

| Estado | Descripción | Acción Siguiente |
|--------|-------------|------------------|
| `pending` | Ganador notificado, esperando contacto | Ganador debe contactar al organizador |
| `contacted` | Código validado, ganador verificado | Organizador coordina entrega |
| `in_delivery` | Premio en proceso de entrega | Organizador entrega el premio |
| `delivered` | Evidencia subida, esperando confirmación | Ganador confirma recepción (7 días) |
| `confirmed` | Entrega confirmada por ganador o auto-confirmada | Flujo completado ✅ |

---

## 🔐 Seguridad

### Código de Verificación

- **Formato**: XXXX-XXXX-XXXX (12 caracteres alfanuméricos)
- **Generación**: Aleatoria con caracteres A-Z y 0-9
- **Validación**: Sin distinción de mayúsculas/minúsculas
- **Uso único**: Solo válido para un sorteo específico

### Validaciones

1. **Solo el ganador** puede confirmar la recepción
2. **Solo el organizador** puede subir evidencia
3. **Código único** por sorteo
4. **Fecha límite** de 7 días para confirmación
5. **Auto-confirmación** si no hay respuesta

---

## 📧 Plantilla de Correo

El correo enviado al ganador incluye:

### Encabezado
- Título: "🎉 ¡FELICIDADES! Has ganado el sorteo"
- Saludo personalizado

### Información del Premio
- Nombre del producto
- Descripción
- Valor
- Número de ticket ganador
- ID del sorteo
- Fecha del sorteo

### Código de Verificación
- Código destacado visualmente
- Instrucciones para guardarlo

### Datos del Organizador
- Nombre
- Email
- Teléfono
- Redes sociales

### Instrucciones
1. Contactar al organizador
2. Proporcionar código único
3. Coordinar entrega
4. Confirmar recepción

### Notas Importantes
- Plazo de 7 días para confirmación
- Auto-confirmación si no responde
- Opción de abrir reclamo

---

## 🛠️ Servicios Implementados

### `winnerVerificationService`

```typescript
// Generar código único
generateVerificationCode(): string

// Obtener información del ganador
getWinnerInfo(raffleId: string): Promise<WinnerInfo | null>

// Validar código del ganador
validateWinnerCode(data: ValidateWinnerCodeDto): Promise<ValidationResult>

// Subir evidencia de entrega
uploadDeliveryEvidence(data: UploadDeliveryEvidenceDto, uploadedBy: string): Promise<WinnerInfo>

// Confirmar recepción del premio
confirmDelivery(data: ConfirmDeliveryDto, userId: string): Promise<WinnerInfo>

// Verificar y auto-confirmar si expiró el plazo
checkAndAutoConfirmDelivery(raffleId: string): Promise<boolean>

// Actualizar estado de entrega
updateDeliveryStatus(raffleId: string, status: DeliveryStatus): Promise<WinnerInfo>
```

### `emailService`

```typescript
// Enviar correo de notificación al ganador
sendWinnerNotificationEmail(data: WinnerNotificationEmailData): Promise<void>
```

---

## 📱 Interfaces de Usuario

### Para el Organizador

1. **Panel de Sorteos Finalizados**
   - Lista de sorteos con ganadores
   - Botón "Validar Ganador"

2. **Modal de Validación**
   - Input para código de verificación
   - Botón "Validar"
   - Mensaje de resultado

3. **Panel de Entrega**
   - Información del ganador
   - Formulario de evidencia
   - Estado de entrega

### Para el Ganador

1. **Correo Electrónico**
   - Notificación completa
   - Código de verificación
   - Datos de contacto

2. **Panel de Sorteos Ganados**
   - Lista de premios ganados
   - Estado de entrega
   - Evidencia del organizador
   - Botón "Confirmar Recepción"

3. **Página de Detalles del Premio**
   - Información completa
   - Código de verificación
   - Contacto del organizador
   - Evidencia de entrega
   - Opciones de confirmación

---

## 🚀 Integración

### 1. Al finalizar un sorteo

```typescript
import { winnerVerificationService } from '@/services/winner-verification-service';
import { emailService } from '@/services/email-service';

// Después de seleccionar el ganador
const verificationCode = winnerVerificationService.generateVerificationCode();

// Actualizar sorteo
await updateDoc(raffleRef, {
  status: RaffleStatus.FINISHED,
  winnerTicketId: winnerTicket.id,
  winnerInfo: {
    userId: winner.id,
    ticketId: winnerTicket.id,
    ticketNumber: winnerTicket.number,
    verificationCode: verificationCode,
    notifiedAt: serverTimestamp(),
    deliveryStatus: 'pending',
  },
  raffleExecutedAt: serverTimestamp(),
});

// Enviar correo al ganador
await emailService.sendWinnerNotificationEmail({
  email: winner.email,
  name: winner.name,
  raffleId: raffle.id,
  raffleTitle: raffle.product.name,
  productName: raffle.product.name,
  productDescription: raffle.product.description,
  productValue: raffle.productValue,
  ticketNumber: winnerTicket.number,
  verificationCode: verificationCode,
  shopName: raffle.shop.name,
  shopEmail: raffle.shop.publicEmail,
  shopPhone: raffle.shop.phone,
  shopSocialMedia: raffle.shop.socialMedia,
  winDate: new Date(),
});
```

### 2. En el panel del organizador

```typescript
// Validar código
const result = await winnerVerificationService.validateWinnerCode({
  raffleId: raffleId,
  verificationCode: code,
});

// Subir evidencia
await winnerVerificationService.uploadDeliveryEvidence(
  {
    raffleId: raffleId,
    photoUrl: photoUrl,
    notes: notes,
    additionalPhotos: additionalPhotos,
  },
  currentUser.id
);
```

### 3. En el panel del ganador

```typescript
// Confirmar recepción
await winnerVerificationService.confirmDelivery(
  {
    raffleId: raffleId,
    confirmed: true,
  },
  currentUser.id
);
```

---

## ✅ Checklist de Implementación

- [x] Tipos TypeScript definidos
- [x] Servicio de verificación del ganador
- [x] Servicio de email actualizado
- [x] Endpoint de API para envío de correo
- [ ] Componente de validación de código (organizador)
- [ ] Componente de subida de evidencia (organizador)
- [ ] Componente de confirmación de recepción (ganador)
- [ ] Actualizar página de sorteos ganados
- [ ] Actualizar página de detalles del ganador
- [ ] Cron job para auto-confirmación
- [ ] Notificaciones en tiempo real
- [ ] Tests unitarios
- [ ] Tests de integración

---

## 📝 Notas Adicionales

### Consideraciones de Producción

1. **Servicio de Correo**: Integrar con SendGrid, AWS SES o similar
2. **Almacenamiento de Imágenes**: Usar Firebase Storage o AWS S3
3. **Cron Jobs**: Implementar con Firebase Cloud Functions o similar
4. **Notificaciones**: Considerar notificaciones push
5. **Logs**: Registrar todas las acciones del flujo
6. **Auditoría**: Mantener historial de cambios de estado

### Mejoras Futuras

1. **Notificaciones en tiempo real** cuando el organizador valida el código
2. **Chat integrado** entre ganador y organizador
3. **Firma digital** para confirmar recepción
4. **Geolocalización** para verificar entrega
5. **Rating** del organizador por parte del ganador
6. **Estadísticas** de tiempo de entrega por organizador

---

## 🆘 Soporte

Para más información sobre la implementación, consulta:

- `frontend/src/services/winner-verification-service.ts`
- `frontend/src/services/email-service.ts`
- `frontend/src/app/api/emails/send-winner-notification/route.ts`
- `frontend/src/types/raffle.ts`

---

**Última actualización**: Diciembre 2024