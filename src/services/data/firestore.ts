
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Subscription } from '../../types/subscription';

export const firestoreData = {
  // User Management
  getUser: async (uid: string) => {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'Users', uid));
    return snap.exists() ? snap.data() : null;
  },

  upsertUser: async (payload: any) => {
    const db = getFirestore();
    await setDoc(doc(db, 'Users', payload.uid), {
      ...payload,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  me: async (uid: string) => {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'Users', uid));
    return snap.exists() ? snap.data() : null;
  },

  // Subscription Management
  getSubscriptions: async (uid: string): Promise<Subscription[]> => {
    const db = getFirestore();
    const q = query(
      collection(db, 'Subscriptions'), 
      where('userId', '==', uid),
      where('isArchived', '==', false)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription));
  },

  addSubscription: async (uid: string, sub: Omit<Subscription, 'id'>) => {
    const db = getFirestore();
    const newRef = doc(collection(db, 'Subscriptions'));
    const payload = {
      ...sub,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(newRef, payload);
    return { id: newRef.id, ...payload };
  },

  updateSubscription: async (id: string, sub: Partial<Subscription>) => {
    const db = getFirestore();
    await updateDoc(doc(db, 'Subscriptions', id), {
      ...sub,
      updatedAt: serverTimestamp(),
    });
  },

  deleteSubscription: async (id: string) => {
    const db = getFirestore();
    await deleteDoc(doc(db, 'Subscriptions', id));
  },

  getAppConfig: async () => {
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, 'Config', 'app'));
      if (snap.exists()) return snap.data();
      return { 
        latestVersion: '2.0.0', 
        minRequiredVersion: '1.0.0',
        updateUrl: 'https://apps.apple.com/app/subsync',
        releaseNotes: 'Bug fixes and performance improvements.',
        isCritical: false
      };
    } catch (e) {
      console.error('Error fetching app config:', e);
      return null;
    }
  }
};
