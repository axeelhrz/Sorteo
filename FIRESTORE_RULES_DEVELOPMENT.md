# Reglas de Firestore para Desarrollo

## ⚠️ IMPORTANTE: Solo para desarrollo/pruebas

Estas reglas permiten acceso completo a usuarios autenticados. **NO usar en producción**.

## Cómo aplicar las reglas:

### 1. Ve a Firebase Console
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **sorteo-b8fb0**
3. En el menú lateral, haz clic en **Firestore Database**
4. Haz clic en la pestaña **Reglas** (Rules)

### 2. Copia y pega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a todos los usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Publica las reglas
1. Haz clic en el botón **Publicar** (Publish)
2. Confirma la publicación

## Reglas para Firebase Storage

También necesitas actualizar las reglas de Storage para subir vouchers:

### 1. Ve a Storage
1. En Firebase Console, haz clic en **Storage** en el menú lateral
2. Haz clic en la pestaña **Reglas** (Rules)

### 2. Copia y pega estas reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura a usuarios autenticados
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Publica las reglas
1. Haz clic en **Publicar** (Publish)
2. Confirma la publicación

## Verificación

Después de aplicar las reglas:

1. **Refresca tu aplicación** en el navegador
2. **Inicia sesión** con tu cuenta
3. Intenta crear un pago
4. Debería funcionar sin errores de permisos

## ⚠️ Advertencia de Seguridad

Estas reglas permiten que **cualquier usuario autenticado** pueda:
- ✅ Leer todos los documentos
- ✅ Crear nuevos documentos
- ✅ Actualizar cualquier documento
- ✅ Eliminar cualquier documento

**Para producción**, necesitarás reglas más restrictivas que:
- Permitan a los usuarios solo ver sus propios datos
- Restrinjan operaciones de admin
- Validen la estructura de los datos

## Reglas de Producción (Implementar después)

Una vez que todo funcione, cambia a reglas más seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pagos
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Sorteos (lectura pública)
    match /raffles/{raffleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Productos (lectura pública)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Tiendas (lectura pública)
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Solución de Problemas

### Si sigues viendo errores de permisos:

1. **Verifica que estés autenticado:**
   - Abre la consola del navegador (F12)
   - Ve a Application → Local Storage
   - Busca `token` - debe tener un valor

2. **Verifica las reglas en Firebase:**
   - Ve a Firestore Database → Reglas
   - Asegúrate de que las reglas estén publicadas
   - Verifica la fecha de última publicación

3. **Limpia la caché:**
   - Cierra sesión
   - Limpia la caché del navegador
   - Vuelve a iniciar sesión

4. **Verifica la autenticación en Firebase:**
   - Ve a Authentication en Firebase Console
   - Verifica que tu usuario esté listado
   - Verifica que el método de autenticación esté habilitado

## Comandos útiles para debugging

En la consola del navegador (F12), ejecuta:

```javascript
// Ver el usuario actual
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Usuario actual:', auth.currentUser);

// Ver el token
auth.currentUser?.getIdToken().then(token => console.log('Token:', token));
```

## Próximos pasos

Una vez que confirmes que todo funciona:

1. ✅ Implementa reglas de producción más restrictivas
2. ✅ Agrega validación de datos en las reglas
3. ✅ Implementa roles de usuario (admin, shop, user)
4. ✅ Agrega logging y auditoría
5. ✅ Configura alertas de seguridad en Firebase