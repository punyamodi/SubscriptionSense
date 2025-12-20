
import { initializeApp, getApps, getApp } from 'firebase/app';
import { runtime, isLive, isFirebaseAuth } from '../../config/runtime';

const firebaseConfig = runtime.FIREBASE;

export function initFirebase() {
  if (!isLive && !isFirebaseAuth) return null;
  
  if (getApps().length === 0) {
    if (!firebaseConfig || !Object.keys(firebaseConfig).length) {
      console.warn('Firebase config missing in app.config.js. Cloud sync may not work.');
      return null;
    }
    return initializeApp(firebaseConfig as any);
  }
  return getApp();
}
