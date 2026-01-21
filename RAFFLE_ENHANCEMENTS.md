# Mejoras de Sorteos - Miniaturas y Redes Sociales

## 📋 Resumen de Implementación

**Fecha:** Enero 2025  
**Versión:** 4.1.0  
**Estado:** ✅ **COMPLETO**

---

## 🎯 Funcionalidades Implementadas

### **1. Miniatura de Sorteo** ✅

#### **Descripción:**
Cada sorteo ahora puede tener una imagen miniatura personalizada que se muestra en las tarjetas de sorteo. Si no hay miniatura, se usa la imagen principal del producto.

#### **Campos Agregados:**

**Tipo Raffle:**
```typescript
interface Raffle {
  // ... campos existentes
  thumbnail?: string; // URL de la miniatura del sorteo
}
```

**DTOs Actualizados:**
```typescript
interface CreateRaffleDto {
  shopId: string;
  productId: string;
  thumbnail?: string; // Nueva miniatura
  specialConditions?: string;
}

interface UpdateRaffleDto {
  thumbnail?: string; // Nueva miniatura
  specialConditions?: string;
}
```

#### **Lógica de Visualización:**
```typescript
// Prioridad: miniatura del sorteo > imagen del producto
const displayImage = raffle.thumbnail || raffle.product?.mainImage;
```

#### **Badge Visual:**
Cuando un sorteo tiene miniatura personalizada, se muestra un badge "Imagen destacada" en la esquina inferior izquierda de la tarjeta.

---

### **2. Redes Sociales de la Tienda** ✅

#### **Descripción:**
Las tiendas ahora pueden tener múltiples redes sociales estructuradas que se muestran en las tarjetas de sorteo con iconos coloridos.

#### **Tipo Actualizado:**

**SocialMedia (nuevo):**
```typescript
interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
}
```

**Shop/Organizer:**
```typescript
interface Organizer {
  // ... campos existentes
  socialMedia?: SocialMedia; // Actualizado de string a objeto
}
```

#### **Formatos Soportados:**

El componente acepta múltiples formatos de entrada:

```typescript
// URLs completas
{
  facebook: "https://facebook.com/tienda",
  instagram: "https://instagram.com/tienda"
}

// Nombres de usuario (se formatean automáticamente)
{
  facebook: "tienda",
  instagram: "@tienda",
  twitter: "tienda"
}

// Números de teléfono para WhatsApp
{
  whatsapp: "51984908819",  // Se convierte a https://wa.me/51984908819
  whatsapp: "+51 984 908 819" // También funciona
}
```

---

## 📦 Componentes Creados

### **1. SocialMediaLinks Component**

**Ubicación:** `frontend/src/components/SocialMediaLinks.tsx`

**Props:**
```typescript
interface SocialMediaLinksProps {
  socialMedia?: SocialMedia;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'colored' | 'outlined';
  showLabels?: boolean;
}
```

**Variantes:**

#### **Default:**
- Fondo gris claro
- Iconos grises
- Hover: fondo más oscuro

#### **Colored:**
- Cada red social con su color oficial
- Facebook: #1877F2
- Instagram: #E4405F
- Twitter: #1DA1F2
- TikTok: #000000
- WhatsApp: #25D366
- Website: #667eea

#### **Outlined:**
- Fondo blanco
- Borde con color de la red social
- Hover: fondo suave

**Tamaños:**
- **Small:** 32px (usado en tarjetas de sorteo)
- **Medium:** 40px (por defecto)
- **Large:** 48px

**Uso:**
```tsx
// En tarjetas de sorteo
<SocialMediaLinks 
  socialMedia={shop.socialMedia} 
  size="small"
  variant="colored"
/>

// Con etiquetas
<SocialMediaLinks 
  socialMedia={shop.socialMedia} 
  size="medium"
  variant="outlined"
  showLabels={true}
/>
```

---

## 🎨 Actualizaciones Visuales

### **RaffleCard Component**

**Cambios:**
1. ✅ Muestra miniatura del sorteo si existe
2. ✅ Badge "Imagen destacada" cuando hay miniatura
3. ✅ Iconos de redes sociales coloridos
4. ✅ Formateo automático de URLs
5. ✅ Prevención de propagación de clicks en redes sociales

**Antes:**
```tsx
// Solo imagen del producto
<Image src={raffle.product.mainImage} />

// Redes sociales como string
{raffle.shop.socialMedia}
```

**Después:**
```tsx
// Miniatura o imagen del producto
<Image src={raffle.thumbnail || raffle.product.mainImage} />

// Badge de miniatura
{raffle.thumbnail && (
  <div className={styles.thumbnailBadge}>
    <span>Imagen destacada</span>
  </div>
)}

// Componente de redes sociales
<SocialMediaLinks 
  socialMedia={raffle.shop.socialMedia} 
  size="small"
  variant="colored"
/>
```

---

## 📊 Estructura de Datos en Firestore

### **Colección: raffles**

```typescript
{
  id: "raffle123",
  shopId: "shop456",
  productId: "product789",
  thumbnail: "https://storage.googleapis.com/bucket/raffle-thumbnail.jpg", // NUEVO
  totalTickets: 100,
  soldTickets: 45,
  status: "active",
  // ... otros campos
}
```

### **Colección: shops**

```typescript
{
  id: "shop456",
  name: "Mi Tienda",
  logo: "https://...",
  socialMedia: { // ACTUALIZADO
    facebook: "mitienda",
    instagram: "@mitienda",
    whatsapp: "51984908819",
    website: "https://mitienda.com"
  },
  // ... otros campos
}
```

---

## 🔧 Migración de Datos

### **Para Redes Sociales Existentes:**

Si tienes tiendas con `socialMedia` como string:

```javascript
// Antes (string)
{
  socialMedia: "https://facebook.com/mitienda"
}

// Después (objeto)
{
  socialMedia: {
    facebook: "mitienda"
  }
}
```

**Script de Migración:**
```javascript
// Ejecutar en Firebase Console o Cloud Functions
const shops = await db.collection('shops').get();

for (const doc of shops.docs) {
  const data = doc.data();
  
  if (typeof data.socialMedia === 'string') {
    // Convertir string a objeto
    const socialMedia = {};
    
    // Detectar tipo de red social del string
    if (data.socialMedia.includes('facebook')) {
      socialMedia.facebook = data.socialMedia;
    } else if (data.socialMedia.includes('instagram')) {
      socialMedia.instagram = data.socialMedia;
    }
    // ... más detecciones
    
    await doc.ref.update({ socialMedia });
  }
}
```

---

## 🎯 Casos de Uso

### **Caso 1: Sorteo con Miniatura Personalizada**

```typescript
// Crear sorteo con miniatura
const raffle = {
  shopId: "shop123",
  productId: "product456",
  thumbnail: "https://storage.googleapis.com/bucket/custom-thumbnail.jpg",
  specialConditions: "Sorteo especial de navidad"
};

// Resultado: La tarjeta muestra la miniatura personalizada
// con el badge "Imagen destacada"
```

### **Caso 2: Tienda con Múltiples Redes Sociales**

```typescript
// Configurar tienda
const shop = {
  name: "Electrónica Pro",
  socialMedia: {
    facebook: "electronicapro",
    instagram: "@electronicapro",
    whatsapp: "51984908819",
    website: "https://electronicapro.com"
  }
};

// Resultado: La tarjeta muestra 4 iconos coloridos
// Facebook (azul), Instagram (rosa), WhatsApp (verde), Website (morado)
```

### **Caso 3: Sorteo sin Miniatura**

```typescript
// Sorteo sin miniatura
const raffle = {
  shopId: "shop123",
  productId: "product456",
  // thumbnail no definido
};

// Resultado: La tarjeta muestra la imagen del producto
// sin badge de "Imagen destacada"
```

---

## 📱 Responsive Design

### **Mobile (< 768px):**
- Iconos de redes sociales: 30px
- Badge de miniatura: más pequeño
- Layout vertical para info de tienda

### **Tablet (768px - 1024px):**
- Iconos de redes sociales: 32px
- Layout optimizado

### **Desktop (> 1024px):**
- Iconos de redes sociales: 32px (small), 40px (medium), 48px (large)
- Layout completo

---

## 🧪 Testing

### **Test 1: Miniatura de Sorteo**

```typescript
// Crear sorteo con miniatura
const raffle = await createRaffle({
  shopId: "shop123",
  productId: "product456",
  thumbnail: "https://example.com/thumbnail.jpg"
});

// Verificar en UI
// ✓ Imagen mostrada es la miniatura
// ✓ Badge "Imagen destacada" visible
// ✓ Hover funciona correctamente
```

### **Test 2: Redes Sociales**

```typescript
// Configurar tienda con redes sociales
const shop = await updateShop("shop123", {
  socialMedia: {
    facebook: "testshop",
    instagram: "@testshop",
    whatsapp: "51999999999"
  }
});

// Verificar en UI
// ✓ 3 iconos visibles
// ✓ Colores correctos (azul, rosa, verde)
// ✓ Links funcionan
// ✓ Click no propaga a tarjeta
```

### **Test 3: Formateo de URLs**

```typescript
// Entrada
const socialMedia = {
  facebook: "mitienda",           // Sin @
  instagram: "@mitienda",         // Con @
  whatsapp: "+51 984 908 819",    // Con espacios
  website: "mitienda.com"         // Sin https://
};

// Salida esperada
// Facebook: https://facebook.com/mitienda
// Instagram: https://instagram.com/mitienda
// WhatsApp: https://wa.me/51984908819
// Website: mitienda.com (sin cambios si no es URL completa)
```

---

## 📈 Beneficios

### **Para Usuarios:**
- ✅ Mejor visualización de sorteos con imágenes personalizadas
- ✅ Fácil acceso a redes sociales de las tiendas
- ✅ Experiencia más profesional y confiable

### **Para Tiendas:**
- ✅ Mayor visibilidad de sus redes sociales
- ✅ Personalización de imagen de sorteos
- ✅ Mejor branding y presencia

### **Para la Plataforma:**
- ✅ Mayor engagement
- ✅ Más tráfico a redes sociales de tiendas
- ✅ Mejor experiencia de usuario

---

## 🚀 Próximas Mejoras Sugeridas

### **Corto Plazo:**
- [ ] Editor de miniaturas en panel de tienda
- [ ] Validación de URLs de redes sociales
- [ ] Analytics de clicks en redes sociales

### **Mediano Plazo:**
- [ ] Galería de miniaturas prediseñadas
- [ ] Más redes sociales (YouTube, LinkedIn, etc.)
- [ ] Preview de miniatura antes de publicar

### **Largo Plazo:**
- [ ] Generador automático de miniaturas
- [ ] A/B testing de miniaturas
- [ ] Estadísticas de engagement por red social

---

## 📞 Soporte

**Email:** soporte@tiketea.com  
**WhatsApp:** +51 984 908 819  
**Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

---

**Última actualización:** Enero 2025  
**Versión:** 4.1.0  
**Estado:** ✅ **COMPLETO Y FUNCIONAL**