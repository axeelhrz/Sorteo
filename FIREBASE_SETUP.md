# Configuración de Firebase

## Habilitar Autenticación por Email/Password

Para que el registro y login funcionen correctamente, necesitas habilitar el método de autenticación por email/password en Firebase Console.

### Pasos:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** (Autenticación)
4. Haz clic en **Get started** (Comenzar) si es la primera vez
5. Ve a la pestaña **Sign-in method** (Método de inicio de sesión)
6. Haz clic en **Email/Password**
7. Habilita el primer toggle (Email/Password)
8. Opcionalmente, puedes habilitar el segundo toggle (Email link - passwordless sign-in) si lo necesitas
9. Haz clic en **Save** (Guardar)

### Configuración de Firestore

Asegúrate de que las reglas de Firestore permitan las operaciones necesarias:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para tiendas
    match /shops/{shopId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Reglas para productos
    match /products/{productId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null;
    }
    
    // Reglas para sorteos
    match /raffles/{raffleId} {
      allow read: if true; // Público para lectura
      allow write: if request.auth != null;
    }
  }
}
```

### Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

Puedes encontrar estas credenciales en:
- Firebase Console → Project Settings → General → Your apps → Web app

