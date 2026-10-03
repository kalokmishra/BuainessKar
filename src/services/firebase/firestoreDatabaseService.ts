import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebaseConfig';
import { IDatabaseService, UserProfile } from '../types';
import { TaxDataState } from '../../context/TaxDataContext';
import { LocalDatabaseService } from '../local/localDatabaseService';

export class FirestoreDatabaseService implements IDatabaseService {
  readonly providerName = 'firestore';
  private localFallback = new LocalDatabaseService();

  /**
   * Evaluates if operations should route to local fallback storage:
   * Demo users (usr_demo_*) or sessions without an authenticated Firebase Auth UID
   * cannot write to Firestore under zero-trust security rules.
   */
  private shouldUseLocal(userId?: string): boolean {
    if (!userId) {
      return !auth.currentUser;
    }
    return (
      userId.startsWith('usr_demo_') ||
      !auth.currentUser ||
      auth.currentUser.uid !== userId
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.getUserProfile(userId);
    }
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async saveUserProfile(user: UserProfile): Promise<void> {
    if (this.shouldUseLocal(user.id)) {
      return this.localFallback.saveUserProfile(user);
    }
    const path = `users/${user.id}`;
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(
        docRef,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: user.createdAt,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  async getTaxData(userId: string): Promise<TaxDataState | null> {
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.getTaxData(userId);
    }
    const path = `users/${userId}/taxProfiles/current`;
    try {
      const docRef = doc(db, 'users', userId, 'taxProfiles', 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data();
        const { userId: _, ...taxData } = raw;
        return taxData as TaxDataState;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async saveTaxData(userId: string, data: TaxDataState): Promise<void> {
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.saveTaxData(userId, data);
    }
    const path = `users/${userId}/taxProfiles/current`;
    try {
      const docRef = doc(db, 'users', userId, 'taxProfiles', 'current');
      const payload = {
        userId,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  subscribeTaxData(userId: string, callback: (data: TaxDataState | null) => void): () => void {
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.subscribeTaxData(userId, callback);
    }
    const path = `users/${userId}/taxProfiles/current`;
    const docRef = doc(db, 'users', userId, 'taxProfiles', 'current');

    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data();
          const { userId: _, ...taxData } = raw;
          callback(taxData as TaxDataState);
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }

  /**
   * Creates a new document in Firestore with createdAt timestamp.
   * If user is unauthenticated or in fallback mode, routes to localFallback.
   */
  async createDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T): Promise<void> {
    const userId = data.userId || (collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined);
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.createDocument(collectionPath, docId, data);
    }
    const path = `${collectionPath}/${docId}`;
    try {
      const docRef = doc(db, collectionPath, docId);
      const payload = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  /**
   * Updates an existing document in Firestore with partial data and updatedAt timestamp.
   */
  async updateDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
    const userId = data.userId || (collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined);
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.updateDocument(collectionPath, docId, data);
    }
    const path = `${collectionPath}/${docId}`;
    try {
      const docRef = doc(db, collectionPath, docId);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Sets (creates or updates with merge) a document in Firestore.
   */
  async setDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T, merge = true): Promise<void> {
    const userId = data.userId || (collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined);
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.setDocument(collectionPath, docId, data, merge);
    }
    const path = `${collectionPath}/${docId}`;
    try {
      const docRef = doc(db, collectionPath, docId);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Retrieves a document by path and ID.
   */
  async getDocument<T extends Record<string, any>>(collectionPath: string, docId: string): Promise<T | null> {
    const userId = collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined;
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.getDocument<T>(collectionPath, docId);
    }
    const path = `${collectionPath}/${docId}`;
    try {
      const docRef = doc(db, collectionPath, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as T;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  /**
   * Retrieves all documents in a collection path.
   */
  async listDocuments<T extends Record<string, any>>(collectionPath: string): Promise<T[]> {
    const userId = collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined;
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.listDocuments<T>(collectionPath);
    }
    const path = collectionPath;
    try {
      const colRef = collection(db, collectionPath);
      const snap = await getDocs(colRef);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as unknown as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  /**
   * Deletes a document by path and ID.
   */
  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    const userId = collectionPath.startsWith('users/') ? collectionPath.split('/')[1] : undefined;
    if (this.shouldUseLocal(userId)) {
      return this.localFallback.deleteDocument(collectionPath, docId);
    }
    const path = `${collectionPath}/${docId}`;
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
