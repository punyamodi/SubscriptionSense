import { useSyncQueue } from './sync.queue';
import { firestoreData } from './firestore';
import { useUserStore } from '../../state/client/userStore';
import { isLive, runtime } from '../../config/runtime';

export const startSyncService = () => {
  if (!isLive) return; // Skip sync entirely in seed/mock mode
  if (!runtime.FIREBASE || Object.keys(runtime.FIREBASE).length === 0) return;

  const { queue, removeFromQueue, incrementRetry } = useSyncQueue.getState();
  const { uid } = useUserStore.getState();

  // If no user or no items, return
  if (!uid || queue.length === 0) return;

  // Process queue sequentially
  queue.forEach(async (op) => {
    try {
      if (op.retryCount > 3) {
        // Max retries reached, could move to a 'dead letter' queue
        console.warn('Max retries reached for op:', op.id);
        return;
      }

      switch (op.collection) {
        case 'subscriptions':
          if (op.type === 'create') {
            await firestoreData.addSubscription(uid, op.payload);
          } else if (op.type === 'update') {
            await firestoreData.updateSubscription(op.documentId, op.payload);
          } else if (op.type === 'delete') {
            await firestoreData.deleteSubscription(op.documentId);
          }
          break;
          
        case 'user_profile':
           if (op.type === 'update') {
             await firestoreData.upsertUser({ uid, ...op.payload });
           }
           break;
      }

      // Success: remove from queue
      removeFromQueue(op.id);
      
    } catch (error) {
      console.error('Sync failed for op:', op.id, error);
      incrementRetry(op.id);
    }
  });
};

// Hook to trigger sync periodically or on network reconnect
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useBackgroundSync = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      if (state.isConnected && isLive) {
        startSyncService();
      }
    });
    return () => unsubscribe();
  }, []);
};
