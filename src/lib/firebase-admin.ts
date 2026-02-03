import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK para uso en API routes (Node.js).
 * Requiere credenciales: FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) o
 * GOOGLE_APPLICATION_CREDENTIALS (ruta al archivo .json).
 */
function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return admin.initializeApp({
        credential: admin.credential.cert(credential),
        storageBucket: credential.storage_bucket || storageBucket,
      });
    } catch (e) {
      console.error('Firebase Admin: invalid FIREBASE_SERVICE_ACCOUNT_JSON', e);
      throw e;
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket,
    });
  }

  throw new Error(
    'Firebase Admin: set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or GOOGLE_APPLICATION_CREDENTIALS (path to key file)'
  );
}

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (!adminApp) {
    adminApp = getAdminApp();
  }
  return adminApp;
}

export function getAdminStorage() {
  return getFirebaseAdmin().storage();
}

export function getAdminFirestore() {
  return getFirebaseAdmin().firestore();
}
