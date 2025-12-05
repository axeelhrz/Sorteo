# Cómo Crear un Usuario Administrador

## Opción 1: Desde Firebase Console (Recomendado)

1. **Registra un usuario normal** desde la aplicación (puede ser con cualquier rol: user o shop)

2. **Ve a Firebase Console**:
   - Abre [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a **Firestore Database**

3. **Busca el usuario**:
   - En la colección `users`, busca el documento del usuario que quieres convertir en admin
   - El ID del documento es el mismo que el `uid` del usuario en Firebase Authentication

4. **Edita el documento**:
   - Haz clic en el documento
   - Edita el campo `role`
   - Cambia el valor de `user` o `shop` a `admin`
   - Guarda los cambios

5. **Inicia sesión**:
   - Cierra sesión en la aplicación
   - Inicia sesión nuevamente con ese usuario
   - Ahora tendrás acceso al panel de administración en `/admin`

## Opción 2: Desde la Consola del Navegador

Si ya estás logueado, puedes ejecutar este código en la consola del navegador (F12):

```javascript
// Obtener tu userId actual
const userId = firebase.auth().currentUser?.uid;

if (!userId) {
  console.error('No estás autenticado');
} else {
  // Importar Firestore
  const { doc, updateDoc, getDoc } = await import('firebase/firestore');
  const { db } = await import('/src/lib/firebase');
  
  // Actualizar el rol a admin
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role: 'admin' });
  
  console.log('✅ Rol actualizado a admin. Recarga la página.');
  location.reload();
}
```

## Opción 3: Script de Consola (Para desarrollo)

Crea un archivo temporal `make-admin.js` en la raíz del proyecto frontend:

```javascript
// Ejecutar con: node make-admin.js <email-del-usuario>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Descarga desde Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const email = process.argv[2];

if (!email) {
  console.error('Uso: node make-admin.js <email>');
  process.exit(1);
}

async function makeAdmin() {
  try {
    // Buscar usuario por email en Authentication
    const user = await admin.auth().getUserByEmail(email);
    
    // Actualizar rol en Firestore
    await db.collection('users').doc(user.uid).update({ role: 'admin' });
    
    console.log(`✅ Usuario ${email} ahora es administrador`);
  } catch (error) {
    console.error('Error:', error);
  }
}

makeAdmin();
```

## Verificar que funciona

1. Inicia sesión con el usuario que convertiste en admin
2. Ve a `/admin` en tu aplicación
3. Deberías ver el panel de administración

## Nota de Seguridad

⚠️ **Importante**: Solo asigna el rol admin a usuarios de confianza. Los administradores tienen acceso completo al sistema.

## Estructura del documento de usuario en Firestore

```json
{
  "name": "Nombre del Usuario",
  "email": "usuario@ejemplo.com",
  "role": "admin",  // ← Cambiar este campo
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

