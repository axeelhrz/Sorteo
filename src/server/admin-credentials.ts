import bcrypt from 'bcryptjs';
import { getAdminFirestore } from '@/lib/firebase-admin';

const COLLECTION = 'adminUsers';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function findAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  const adminFirestore = getAdminFirestore();
  const normalizedEmail = normalizeEmail(email);
  const snapshot = await adminFirestore
    .collection(COLLECTION)
    .where('emailLower', '==', normalizedEmail)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
  };
}

export async function createAdminUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminUserRecord> {
  const adminFirestore = getAdminFirestore();
  const normalizedEmail = normalizeEmail(email);

  const existing = await findAdminUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Ya existe un administrador con ese correo.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const docRef = await adminFirestore.collection(COLLECTION).add({
    name,
    email,
    emailLower: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });

  return {
    id: docRef.id,
    name,
    email,
    passwordHash,
  };
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUserRecord | null> {
  const adminUser = await findAdminUserByEmail(email);
  if (!adminUser) {
    return null;
  }

  const isValid = await bcrypt.compare(password, adminUser.passwordHash);
  return isValid ? adminUser : null;
}
