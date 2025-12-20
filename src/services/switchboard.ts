// src/services/switchboard.ts
import { seedData } from './data/seed';
import { mockAuth } from './auth/mockAuth';
import { firestoreData } from './data/firestore';
import { firebaseAuth } from './auth/firebaseAuth';
import { isLive, isFirebaseAuth } from '../config/runtime';

export const data = isLive ? firestoreData : seedData;
export const auth = isFirebaseAuth ? firebaseAuth : mockAuth;
