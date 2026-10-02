import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseConfig';
import { IDatabaseService, UserProfile } from '../types';
import { TaxDataState } from '../../context/TaxDataContext';

export class FirestoreDatabaseService implements IDatabaseService {
  readonly providerName = 'firestore';

  async getUserProfile(userId: string): Promise<UserProfile | null> {
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
        // Critical constraint: handleFirestoreError must be used in onSnapshot error callback
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  }
}
