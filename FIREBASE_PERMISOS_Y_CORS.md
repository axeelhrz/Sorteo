# Firebase: permisos (Firestore) y CORS (Storage)

## 0. Oportunidades públicas (marketplace) sin login

El listado de oportunidades (`/sorteos`) y el detalle (`/sorteos/[id]`) deben ser visibles **sin iniciar sesión**. Para evitar depender de reglas de Firestore que permitan lectura anónima, la app usa **API routes** con **Firebase Admin SDK**:

- `GET /api/raffles/active` – lista de oportunidades activas
- `GET /api/raffles/[id]` – detalle de una oportunidad
- `GET /api/raffles/categories` – categorías
- `GET /api/raffles/shops` – organizadores con oportunidades activas

El Admin SDK tiene acceso total a Firestore y no está sujeto a las reglas de seguridad del cliente. Las oportunidades se cargan correctamente aunque el usuario no esté logueado.

---

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

## 2. Subida de comprobante (API) y credenciales de servidor

La ruta `/api/payments/confirm-with-voucher` sube el comprobante **desde el servidor** usando **Firebase Admin SDK**. Para que funcione en producción (Vercel) o en local, debes configurar una de estas variables:

- **`FIREBASE_SERVICE_ACCOUNT_JSON`** (recomendado): contenido completo del JSON de la cuenta de servicio como **una sola línea** (sin saltos de línea).  
  - **Local:** en `.env.local` añade una línea así (sustituye `...` por el JSON en una línea):
    ```bash
    FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"sorteo-b8fb0",...}
    ```
    Para convertir el JSON a una línea: quita todos los saltos de línea y espacios entre claves/valores, o en la terminal (macOS/Linux): `cat tu-archivo.json | jq -c .`
  - **Vercel:** Project → Settings → Environment Variables → añade `FIREBASE_SERVICE_ACCOUNT_JSON` y pega el JSON en una sola línea.
- **`GOOGLE_APPLICATION_CREDENTIALES`** (alternativa local): ruta al archivo `.json` de la cuenta de servicio (ej. `./service-account.json`). No subas ese archivo a Git.

**Importante:** No subas el JSON de la cuenta de servicio al repositorio ni lo compartas. Si ya lo hiciste, rota la clave en Firebase Console (Service accounts → Generate new private key) y usa la nueva.

Sin una de estas dos, la API devolverá **500** con un mensaje que indica que faltan credenciales. No uses el SDK de Firebase del navegador en esta ruta; en Node.js debe usarse Admin.

---

## 3. Comprobante de pago (voucher) y CORS en Storage

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

## 4. Evidencia de entrega (delivery-evidence) y 403 en Storage

**Problema:** Al subir la evidencia de entrega del premio (foto) desde el panel del organizador, Firebase Storage devolvía **403 (storage/unauthorized)** porque las reglas del bucket no permitían escritura en `delivery-evidence/` para el usuario del cliente.

**Solución en la app:** La subida de evidencia de entrega se hace **desde el servidor** mediante **Firebase Admin Storage**:

1. El organizador envía la(s) imagen(es) al backend: `POST /api/uploads/delivery-evidence` (FormData con campo `file`).
2. El backend sube el archivo a Storage con el Admin SDK y devuelve la URL firmada.

No hace falta cambiar las reglas de Storage para `delivery-evidence/`; el servidor usa la cuenta de servicio (misma que para Firestore Admin).

---

## 5. Resumen de cambios hechos en el código

- **Checkout:** El comprobante se envía a `/api/payments/confirm-with-voucher` (mismo origen) en lugar de subirse desde el navegador a Storage → se evita CORS en ese flujo.
- **Evidencia de entrega:** Las imágenes se envían a `/api/uploads/delivery-evidence` y el servidor las sube con Firebase Admin Storage → se evita el 403 en el cliente.
- **Enlaces /panel:** Se reemplazaron por `/dashboard`, `/dashboard/store` o `/sorteos/[id]` para evitar 404.

Si después de ajustar las reglas de Firestore el error de permisos sigue, revisa que el usuario esté logueado y que su token se envíe correctamente en las peticiones.
