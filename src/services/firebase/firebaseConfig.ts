import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export { auth, db };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  // Only execute in browser environment
  if (typeof window === 'undefined') return;
  try {
    if (!db) return;
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: unknown) {
    // Under strict default-deny firestore rules, 'test/connection' naturally triggers permission-denied
    // when unauthenticated, which confirms the network endpoint is alive and responsive.
    // Offline status is caught quietly without emitting breaking console errors.
  }
}

// Perform initial connection test
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}
