# Flujo Completo de Creación de Sorteos - TIKETEA

## 📋 Descripción General
El sistema ahora permite crear sorteos de forma completa y funcional. El flujo es:
1. **Subir imagen del producto** → Firebase Storage
2. **Crear producto** → Firestore (con imagen)
3. **Crear sorteo** → Firestore (vinculado al producto)

---

## 🔄 Flujo Detallado

### 1. **Carga de Imagen**
- **Servicio:** `uploadService.uploadProductImage(file)`
- **Ubicación:** `src/services/upload-service.ts`
- **Proceso:**
  - Valida tipo de archivo (debe ser imagen)
  - Valida tamaño (máximo 5MB)
  - Sube a Firebase Storage en carpeta `products/`
  - Retorna URL de descarga pública

### 2. **Creación de Producto**
- **Servicio:** `productService.createProduct(data)`
- **Ubicación:** `src/services/firebase-product-service.ts`
- **Datos requeridos:**
  ```typescript
  {
    shopId: string;           // ID del organizador
    name: string;             // Nombre del producto
    description: string;      // Descripción
    value: number;            // Valor de ticket (S/.)
    mainImage: string;        // URL de la imagen (desde upload)
    height: number;           // Altura (default: 10)
    width: number;            // Ancho (default: 10)
    depth: number;            // Profundidad (default: 10)
    hasDelivery?: boolean;    // ¿Incluye envío?
    deliveryZones?: string;   // Zonas de entrega
    pickupInStore?: boolean;  // ¿Recojo en tienda?
  }
  ```
- **Resultado:** Producto creado en Firestore con estado ACTIVE

### 3. **Creación de Sorteo**
- **Servicio:** `raffleService.createRaffle(data)`
- **Ubicación:** `src/services/firebase-raffle-write-service.ts`
- **Datos requeridos:**
  ```typescript
  {
    shopId: string;              // ID del organizador
    productId: string;           // ID del producto creado
    specialConditions?: string;  // Condiciones especiales
  }
  ```
- **Cálculo automático:**
  - `totalTickets = productValue × 2`
  - Ejemplo: Si el ticket cuesta S/. 50, se generan 100 tickets
- **Resultado:** Sorteo creado en Firestore con estado DRAFT

---

## 🎯 Componentes Involucrados

### Frontend
- **Componente:** `CreateRaffleForm` (`src/components/ShopPanel/CreateRaffleForm.tsx`)
- **Modal:** Se abre desde el Dashboard del Organizador
- **Validaciones:**
  - Nombre del producto (obligatorio)
  - Foto del producto (obligatoria)
  - Descripción (obligatoria)
  - Valor de ticket > 0 (obligatorio)
  - WhatsApp del organizador (obligatorio)
  - Opciones de entrega (obligatorio)

### Backend/Servicios
1. **Upload Service** - Sube imágenes a Firebase Storage
2. **Product Service** - Crea productos en Firestore
3. **Raffle Service** - Crea sorteos en Firestore

---

## ✅ Checklist de Funcionalidad

- [x] Botones compactos y funcionales
- [x] Carga de imágenes a Firebase Storage
- [x] Creación de productos con imagen
- [x] Creación de sorteos vinculados a productos
- [x] Cálculo automático de tickets (valor × 2)
- [x] Validaciones completas del formulario
- [x] Mensajes de error específicos
- [x] Redirección después de crear sorteo
- [x] Modal de creación desde dashboard

---

## 🧪 Cómo Probar

### Desde el Dashboard del Organizador
1. Ir a: `https://sorteo-self.vercel.app/dashboard/store`
2. Hacer clic en botón "Nuevo Sorteo" (compacto)
3. Completar formulario:
   - Nombre del producto
   - Foto del producto
   - Descripción
   - Valor de ticket (ej: 50)
   - WhatsApp
   - Opciones de entrega
4. Hacer clic en "Crear sorteo"
5. Esperar a que se cree el producto y sorteo
6. Ser redirigido a la página del sorteo

### Desde Modal
1. Hacer clic en "Crear Sorteo" desde la sección "Mis Sorteos"
2. Se abre modal con el formulario
3. Completar y enviar
4. Modal se cierra y se recarga la lista

---

## 🔧 Configuración Requerida

### Firebase Storage
- Debe estar habilitado en tu proyecto Firebase
- Reglas de seguridad deben permitir uploads autenticados:
  ```
  match /products/{allPaths=**} {
    allow read: if true;
    allow write: if request.auth != null;
  }
  ```

### Firestore
- Colecciones requeridas:
  - `products` - Almacena productos
  - `raffles` - Almacena sorteos
  - `shops` - Almacena organizadores

---

## 📊 Estructura de Datos

### Documento de Producto (Firestore)
```json
{
  "shopId": "shop_123",
  "name": "iPhone 15 Pro Max",
  "description": "Último modelo de Apple...",
  "value": 50,
  "mainImage": "https://storage.googleapis.com/...",
  "height": 10,
  "width": 10,
  "depth": 10,
  "status": "active",
  "createdAt": "2024-01-26T10:30:00Z",
  "updatedAt": "2024-01-26T10:30:00Z"
}
```

### Documento de Sorteo (Firestore)
```json
{
  "shopId": "shop_123",
  "productId": "product_456",
  "productValue": 50,
  "totalTickets": 100,
  "soldTickets": 0,
  "status": "draft",
  "specialConditions": "Envío incluido\nWhatsApp Organizador: +51 999 999 999",
  "createdAt": "2024-01-26T10:30:00Z",
  "updatedAt": "2024-01-26T10:30:00Z"
}
```

---

## 🐛 Troubleshooting

### Error: "Error al subir la imagen"
- Verificar que Firebase Storage esté habilitado
- Verificar reglas de seguridad de Storage
- Verificar tamaño de imagen (máximo 5MB)

### Error: "Error al crear el producto"
- Verificar que Firestore esté habilitado
- Verificar que la colección `products` exista
- Revisar console del navegador para más detalles

### Error: "Error al crear el sorteo"
- Verificar que el producto se creó correctamente
- Verificar que la colección `raffles` exista
- Revisar console del navegador para más detalles

---

## 📝 Notas Importantes

1. **Tickets automáticos:** Se calculan como `valor × 2`
   - Ejemplo: S/. 50 → 100 tickets

2. **Estado inicial:** Los sorteos se crean en estado DRAFT
   - Deben ser enviados para aprobación antes de activarse

3. **Imagen obligatoria:** Cada producto debe tener una imagen
   - Se sube a Firebase Storage automáticamente

4. **WhatsApp:** Se guarda en las condiciones especiales del sorteo
   - Permite que TIKETEA contacte al organizador

5. **Entrega:** Se puede configurar envío o recojo
   - Envío: Local, Nacional, Internacional
   - Recojo: Dirección y distrito específicos

---

## 🚀 Próximos Pasos

- [ ] Implementar edición de sorteos
- [ ] Implementar eliminación de sorteos
- [ ] Agregar más opciones de configuración
- [ ] Implementar vista previa del sorteo
- [ ] Agregar validación de imágenes más robusta