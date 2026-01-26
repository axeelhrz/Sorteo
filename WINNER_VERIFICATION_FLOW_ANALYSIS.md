# Análisis del Flujo de Verificación de Sorteo

## Descripción General del Flujo Requerido

El flujo de verificación de sorteo debe seguir estos pasos:

1. **Notificación al Ganador**: El ganador recibe un correo con:
   - ID del sorteo
   - Información del producto
   - Ticket ganador
   - Datos del Organizador (email, teléfono, redes sociales)
   - **Código único de ganador** (generado por el sistema)

2. **Contacto con Organizador**: El ganador se contacta con el Organizador y le proporciona el código único

3. **Validación del Código**: El Organizador ingresa el código en la web para validar al ganador

4. **Carga de Evidencia**: El Organizador sube fotos de la entrega del premio

5. **Cierre del Flujo**: El Organizador marca como concluido

6. **Confirmación del Ganador**: El ganador confirma recepción en la web
   - Tiene 7 días desde que el Organizador cierra
   - Si no confirma en 7 días, se da por confirmada automáticamente

---

## Estado Actual de Implementación

### ✅ IMPLEMENTADO

#### 1. Generación de Código Único
- **Archivo**: `src/services/winner-verification-service.ts`
- **Función**: `generateVerificationCode()`
- **Formato**: XXXX-XXXX-XXXX (12 caracteres alfanuméricos)
- **Estado**: ✅ Completamente implementado

#### 2. Tipos de Datos
- **Archivo**: `src/types/raffle.ts`
- **Interfaces**:
  - `WinnerInfo`: Contiene toda la información del ganador
  - `DeliveryEvidence`: Estructura para evidencia de entrega
  - `ValidateWinnerCodeDto`: DTO para validación de código
  - `UploadDeliveryEvidenceDto`: DTO para subida de evidencia
  - `ConfirmDeliveryDto`: DTO para confirmación de entrega
- **Estado**: ✅ Completamente implementado

#### 3. Servicio de Verificación de Ganador
- **Archivo**: `src/services/winner-verification-service.ts`
- **Funciones Implementadas**:
  - `getWinnerInfo()`: Obtiene información del ganador
  - `validateWinnerCode()`: Valida el código del ganador
  - `uploadDeliveryEvidence()`: Sube evidencia de entrega
  - `confirmDelivery()`: Confirma recepción del ganador
  - `checkAndAutoConfirmDelivery()`: Auto-confirma después de 7 días
  - `updateDeliveryStatus()`: Actualiza estado de entrega
- **Estado**: ✅ Completamente implementado

#### 4. Componente de Carga de Evidencia
- **Archivo**: `src/components/ShopPanel/DeliveryEvidenceUpload.tsx`
- **Funcionalidad**:
  - Carga de foto principal
  - Carga de hasta 3 fotos adicionales
  - Notas sobre la entrega
  - Validación de tamaño (máx 5MB)
- **Estado**: ✅ Completamente implementado

#### 5. Servicio de Email
- **Archivo**: `src/services/email-service.ts`
- **Función**: `sendWinnerNotificationEmail()`
- **Datos Enviados**:
  - Email del ganador
  - Nombre del ganador
  - ID del sorteo
  - Información del producto
  - Número de ticket ganador
  - **Código de verificación**
  - Datos del Organizador (nombre, email, teléfono, redes sociales)
  - Fecha de ganancia
- **Estado**: ✅ Completamente implementado

---

## ❌ FALTA IMPLEMENTAR

### 1. Interfaz de Validación de Código (Organizador)
**Ubicación**: Panel del Organizador
**Descripción**: Formulario donde el Organizador ingresa el código único del ganador para validarlo

**Componentes Necesarios**:
- Formulario con campo de entrada para código
- Botón de validación
- Mensajes de éxito/error
- Información del ganador validado (nombre, email, ticket)

**Archivos a Crear/Modificar**:
- `src/components/ShopPanel/WinnerCodeValidation.tsx` (NUEVO)
- `src/app/panel/sorteos/[id]/page.tsx` (MODIFICAR)

### 2. Interfaz de Confirmación de Entrega (Ganador)
**Ubicación**: Panel del Usuario
**Descripción**: Interfaz donde el ganador confirma la recepción del premio

**Componentes Necesarios**:
- Información del sorteo y producto
- Información de la evidencia subida por el Organizador
- Botón de confirmación
- Contador de días restantes (7 días)
- Mensaje de auto-confirmación

**Archivos a Crear/Modificar**:
- `src/components/UserPanel/DeliveryConfirmation.tsx` (MODIFICAR/MEJORAR)
- `src/app/user-panel/won-raffles/page.tsx` (MODIFICAR)

### 3. Flujo Completo en Panel del Organizador
**Ubicación**: Detalle del Sorteo
**Descripción**: Mostrar el estado del flujo de verificación

**Estados a Mostrar**:
- `pending`: Esperando contacto del ganador
- `contacted`: Ganador validado con código
- `in_delivery`: Evidencia subida, esperando confirmación
- `delivered`: Evidencia subida
- `confirmed`: Entrega confirmada por el ganador

**Archivos a Crear/Modificar**:
- `src/components/ShopPanel/RaffleDetail.tsx` (MODIFICAR)
- `src/components/ShopPanel/WinnerValidationFlow.tsx` (NUEVO)

### 4. Flujo Completo en Panel del Usuario
**Ubicación**: Sorteos Ganados
**Descripción**: Mostrar el estado del flujo desde la perspectiva del ganador

**Estados a Mostrar**:
- Notificación recibida
- Código único
- Instrucciones de contacto
- Evidencia de entrega
- Confirmación pendiente
- Confirmación completada

**Archivos a Crear/Modificar**:
- `src/app/user-panel/won-raffles/page.tsx` (MODIFICAR)

### 5. Endpoint de API para Validación de Código
**Ubicación**: Backend API
**Descripción**: Endpoint para validar el código del ganador

**Endpoint Necesario**:
```
POST /api/raffles/{raffleId}/validate-winner-code
Body: { verificationCode: string }
Response: { valid: boolean, winnerInfo: WinnerInfo, message: string }
```

**Archivos a Crear**:
- `src/app/api/raffles/[id]/validate-winner/route.ts` (NUEVO)

### 6. Endpoint de API para Confirmación de Entrega
**Ubicación**: Backend API
**Descripción**: Endpoint para que el ganador confirme la recepción

**Endpoint Necesario**:
```
POST /api/raffles/{raffleId}/confirm-delivery
Body: { confirmed: boolean, feedback?: string }
Response: { success: boolean, winnerInfo: WinnerInfo }
```

**Archivos a Crear**:
- `src/app/api/raffles/[id]/confirm-delivery/route.ts` (NUEVO)

### 7. Cron Job para Auto-Confirmación
**Ubicación**: Cloud Functions / Cron Job
**Descripción**: Verificar diariamente si hay entregas que deben auto-confirmarse

**Funcionalidad**:
- Ejecutarse diariamente
- Verificar sorteos con estado `delivered`
- Verificar si han pasado 7 días desde `deliveryDeadline`
- Auto-confirmar si es necesario

**Archivos a Crear/Modificar**:
- `src/app/api/cron/check-deliveries/route.ts` (MODIFICAR/MEJORAR)

### 8. Notificaciones Adicionales
**Descripción**: Correos para diferentes etapas del flujo

**Correos Necesarios**:
1. Correo al Organizador cuando el ganador valida el código
2. Correo al ganador cuando el Organizador sube evidencia
3. Correo de recordatorio si faltan 2 días para expirar
4. Correo de confirmación automática

**Archivos a Modificar**:
- `src/services/email-service.ts` (AGREGAR FUNCIONES)

---

## Diagrama del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE VERIFICACIÓN                        │
└─────────────────────────────────────────────────────────────────┘

1. SORTEO FINALIZA
   ↓
2. SISTEMA GENERA CÓDIGO ÚNICO
   ↓
3. CORREO AL GANADOR
   ├─ ID Sorteo
   ├─ Producto
   ├─ Ticket Ganador
   ├─ Datos Organizador
   └─ CÓDIGO ÚNICO
   ↓
4. GANADOR CONTACTA ORGANIZADOR
   (Proporciona código)
   ↓
5. ORGANIZADOR VALIDA CÓDIGO EN WEB
   ├─ Ingresa código
   ├─ Sistema valida
   └─ Estado: "contacted"
   ↓
6. ORGANIZADOR SUBE EVIDENCIA
   ├─ Foto principal
   ├─ Fotos adicionales
   ├─ Notas
   └─ Estado: "delivered"
   ↓
7. GANADOR RECIBE NOTIFICACIÓN
   ├─ Evidencia disponible
   └─ Tiene 7 días para confirmar
   ↓
8. GANADOR CONFIRMA RECEPCIÓN
   ├─ Opción A: Confirma manualmente
   └─ Opción B: Auto-confirma después de 7 días
   ↓
9. FLUJO COMPLETADO
   └─ Estado: "confirmed"
```

---

## Prioridad de Implementación

### ALTA PRIORIDAD (Crítico para el flujo)
1. Interfaz de Validación de Código (Organizador)
2. Interfaz de Confirmación de Entrega (Ganador)
3. Endpoints de API para validación y confirmación
4. Mejora del componente DeliveryConfirmation

### MEDIA PRIORIDAD (Mejora de UX)
1. Flujo visual completo en panel del Organizador
2. Flujo visual completo en panel del Usuario
3. Notificaciones adicionales por email
4. Cron job para auto-confirmación

### BAJA PRIORIDAD (Optimización)
1. Mejoras visuales
2. Mensajes más detallados
3. Historial de eventos

---

## Notas Técnicas

### Generación de Código
- Formato: XXXX-XXXX-XXXX
- Caracteres: A-Z, 0-9
- Longitud: 12 caracteres
- Validación: Case-insensitive, sin espacios

### Estados de Entrega
```typescript
type DeliveryStatus = 
  | 'pending'      // Esperando contacto
  | 'contacted'    // Código validado
  | 'in_delivery'  // En proceso de entrega
  | 'delivered'    // Evidencia subida
  | 'confirmed'    // Confirmado por gana

### Deadline de Confirmación
- Se calcula al subir evidencia
- 7 días desde la subida
- Auto-confirmación si expira sin confirmación manual

### Validación de Código
- Normalización: Mayúsculas, sin espacios
- Comparación: Exacta después de normalizar
- Intento único: No hay límite de intentos (considerar agregar)

---

## Checklist de Implementación

- [ ] Componente WinnerCodeValidation
- [ ] Interfaz de confirmación mejorada
- [ ] Endpoints de API
- [ ] Notificaciones por email
- [ ] Cron job de auto-confirmación
- [ ] Pruebas del flujo completo
- [ ] Documentación de usuario
- [ ] Documentación de organizador