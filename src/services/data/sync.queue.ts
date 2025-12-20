import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'subscriptions' | 'user_profile' | 'user_stats';
  documentId: string;
  payload?: any;
  timestamp: number;
  retryCount: number;
};

type SyncState = {
  queue: SyncOperation[];
  addToQueue: (op: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  incrementRetry: (id: string) => void;
};

export const useSyncQueue = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (op) => set((state) => ({
        queue: [...state.queue, {
          ...op,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          retryCount: 0
        }]
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter(q => q.id !== id)
      })),
      clearQueue: () => set({ queue: [] }),
      incrementRetry: (id) => set((state) => ({
        queue: state.queue.map(q => q.id === id ? { ...q, retryCount: q.retryCount + 1 } : q)
      }))
    }),
    {
      name: 'sync-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
