# Firebase: permisos (Firestore) y CORS (Storage)

## 1. Error: "Missing or insufficient permissions" al cargar organizadores/shops

**Causa:** El panel de admin (`/dashboard/admin` → Organizadores) lee la colección `shops` desde el navegador. Si las reglas de Firestore no permiten esa lectura, aparece este error.

**Solución:** En la consola de Firebase → Firestore Database → Rules, asegura que usuarios autenticados (o solo admins) puedan leer `shops`. Ejemplo mínimo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer shops (necesario para admin y marketplace)
    match /shops/{shopId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // o restringir a admin
    }
    // Ajusta el resto de colecciones (users, raffles, payments, etc.) según tu lógica
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /raffles/{raffleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    // ...
  }
}
```

Si quieres que **solo admins** lean `shops`, necesitas guardar el rol en el documento del usuario (por ejemplo `users/{uid}` con campo `role: 'admin'`) y usar algo como:

```javascript
match /shops/{shopId} {
  allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if request.auth != null;
}
```

Ajusta las reglas al resto de colecciones según quién deba leer/escribir.

---

## 2. Comprobante de pago (voucher) y CORS en Storage

**Problema:** Al subir el comprobante en checkout, el navegador podía hacer la subida directa a Firebase Storage y fallar por CORS.

**Solución en la app:** La subida del comprobante se hace ahora **desde tu servidor** (API en el mismo dominio). El flujo es:

1. El usuario envía el archivo al backend: `POST /api/payments/confirm-with-voucher`
2. El backend (Vercel) sube el archivo a Firebase Storage y actualiza Firestore.

Así **no hace falta** configurar CORS en el bucket de Storage solo para el comprobante; el navegador ya no habla directamente con Storage en ese flujo.

**Si aún ves CORS** en otras partes (por ejemplo imágenes de productos cargadas desde el cliente), aplica CORS al bucket como en `CORS_SETUP_INSTRUCTIONS.md`:

```bash
gsutil cors set cors.json gs://sorteo-b8fb0.firebasestorage.app
```

---

## 3. Resumen de cambios hechos en el código

- **Checkout:** El comprobante se envía a `/api/payments/confirm-with-voucher` (mismo origen) en lugar de subirse desde el navegador a Storage → se evita CORS en ese flujo.
- **Enlaces /panel:** Se reemplazaron por `/dashboard`, `/dashboard/store` o `/sorteos/[id]` para evitar 404.

Si después de ajustar las reglas de Firestore el error de permisos sigue, revisa que el usuario esté logueado y que su token se envíe correctamente en las peticiones.
