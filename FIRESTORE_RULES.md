# Reglas de Seguridad de Firestore

Copia y pega estas reglas en Firebase Console → Firestore Database → Rules

## Reglas Completas para el Marketplace

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // REGLAS PARA USUARIOS
    // ============================================
    match /users/{userId} {
      // Los usuarios pueden leer su propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Los usuarios pueden crear su propio documento al registrarse
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Los usuarios pueden actualizar su propio perfil
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Solo admins pueden eliminar usuarios
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ============================================
    // REGLAS PARA TIENDAS
    // ============================================
    match /shops/{shopId} {
      // Lectura pública para el marketplace
      allow read: if true;
      
      // El dueño de la tienda puede crear/actualizar su tienda
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      // Solo el dueño o admin puede eliminar
      allow delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // ============================================
    // REGLAS PARA PRODUCTOS
    // ============================================
    match /products/{productId} {
      // Lectura pública para el marketplace
      allow read: if true;
      
      // Solo el dueño de la tienda puede crear productos
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/shops/$(request.resource.data.shopId)) &&
        get(/databases/$(database)/documents/shops/$(request.resource.data.shopId)).data.userId == request.auth.uid;
      
      // Solo el dueño de la tienda puede actualizar sus productos
      allow update: if request.auth != null && 
        exists(/databases/$(database)/documents/shops/$(resource.data.shopId)) &&
        get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.userId == request.auth.uid;
      
      // Solo el dueño o admin puede eliminar
      allow delete: if request.auth != null && 
        (exists(/databases/$(database)/documents/shops/$(resource.data.shopId)) &&
         get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // ============================================
    // REGLAS PARA SORTEOS
    // ============================================
    match /raffles/{raffleId} {
      // Lectura pública para el marketplace
      allow read: if true;
      
      // Solo el dueño de la tienda puede crear sorteos
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/shops/$(request.resource.data.shopId)) &&
        get(/databases/$(database)/documents/shops/$(request.resource.data.shopId)).data.userId == request.auth.uid;
      
      // Solo el dueño de la tienda o admin puede actualizar sorteos
      allow update: if request.auth != null && 
        (exists(/databases/$(database)/documents/shops/$(resource.data.shopId)) &&
         get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Solo el dueño o admin puede eliminar
      allow delete: if request.auth != null && 
        (exists(/databases/$(database)/documents/shops/$(resource.data.shopId)) &&
         get(/databases/$(database)/documents/shops/$(resource.data.shopId)).data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // ============================================
    // REGLAS PARA TICKETS (si los usas)
    // ============================================
    match /tickets/{ticketId} {
      // Los usuarios pueden leer sus propios tickets
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Cualquier usuario autenticado puede crear tickets (al comprar)
      allow create: if request.auth != null;
      
      // Solo admins pueden actualizar/eliminar tickets
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ============================================
    // REGLAS PARA PAGOS (si los usas)
    // ============================================
    match /payments/{paymentId} {
      // Los usuarios pueden leer sus propios pagos
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Cualquier usuario autenticado puede crear pagos
      allow create: if request.auth != null;
      
      // Solo admins pueden actualizar/eliminar pagos
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ============================================
    // REGLAS PARA DEPÓSITOS (si los usas)
    // ============================================
    match /deposits/{depositId} {
      // Los usuarios pueden leer sus propios depósitos
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Solo admins pueden crear/actualizar/eliminar depósitos
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ============================================
    // REGLAS PARA QUEJAS/RECLAMOS (si los usas)
    // ============================================
    match /complaints/{complaintId} {
      // Los usuarios pueden leer sus propias quejas
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Cualquier usuario autenticado puede crear quejas
      allow create: if request.auth != null;
      
      // Los usuarios pueden actualizar sus propias quejas, admins pueden actualizar todas
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Solo admins pueden eliminar
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Reglas Simplificadas (Solo para Desarrollo/Pruebas)

Si estás en desarrollo y quieres reglas más permisivas temporalmente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMITE TODO - SOLO PARA DESARROLLO
    // ⚠️ NO USAR EN PRODUCCIÓN ⚠️
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Reglas Públicas de Lectura (Solo Marketplace)

Si solo necesitas que el marketplace sea público para lectura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública para marketplace
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /raffles/{raffleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Usuarios solo pueden leer/escribir su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Cómo Aplicar las Reglas

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. Copia y pega las reglas que necesites
6. Haz clic en **Publish** (Publicar)

## Notas Importantes

- Las reglas completas son más seguras y recomendadas para producción
- Las reglas simplificadas son solo para desarrollo rápido
- Siempre prueba las reglas en el simulador de Firebase antes de publicar
- Las reglas se aplican inmediatamente después de publicar

