import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { differenceInMonths, parseISO, startOfDay } from 'date-fns';
import { Subscription, SpendingStats, Category } from '../../types/subscription';
import { makeKV } from './storage';
import { calculateNextRenewal } from '../../utils/date';
import { NotificationService } from '../../services/notification.service';
import { CurrencyService } from '../../services/currency.service';
import { useUserStore } from './userStore';
import { useSyncQueue, SyncOperation } from '../../services/data/sync.queue';
import { startSyncService } from '../../services/data/sync.service';
import { isLive } from '../../config/runtime';

interface SubscriptionState {
  subscriptions: Subscription[];
  categories: Category[];
  isLoaded: boolean;
  
  // Actions
  addSubscription: (sub: Omit<Subscription, 'id' | 'nextRenewalDate' | 'isActive' | 'isArchived'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  archiveSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;
  setSubscriptions: (subs: Subscription[]) => void;
  setLoaded: (v: boolean) => void;
  
  // Analytics
  getStats: () => SpendingStats;
}

const kv = makeKV();

// Enqueue sync operations only when we are in live mode and have a user
const queueForSync = (op: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => {
  if (!isLive) return;
  const { uid } = useUserStore.getState();
  if (!uid) return;
  const { addToQueue } = useSyncQueue.getState();
  addToQueue(op);
  startSyncService();
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      categories: [
        { id: '1', name: 'Streaming', icon: 'play-circle', color: '#FF4B4B' },
        { id: '2', name: 'Software', icon: 'code', color: '#4B7BFF' },
        { id: '3', name: 'Utilities', icon: 'zap', color: '#FFB84B' },
        { id: '4', name: 'Health', icon: 'heart', color: '#4BFF8B' },
        { id: '5', name: 'Education', icon: 'book', color: '#A34BFF' },
      ],
      isLoaded: false,

      setSubscriptions: (subs) => set({ subscriptions: subs, isLoaded: true }),
      setLoaded: (v) => set({ isLoaded: v }),

      addSubscription: (sub) => {
        const id = Math.random().toString(36).substring(7);
        const newSub: Subscription = {
          ...sub,
          id,
          nextRenewalDate: calculateNextRenewal({ ...sub, id, nextRenewalDate: '' } as Subscription),
          isActive: true,
          isArchived: false,
          sharedWith: sub.sharedWith || 1,
        };
        set((state) => ({
          subscriptions: [...state.subscriptions, newSub],
        }));
        NotificationService.scheduleSubscriptionReminder(newSub);

        queueForSync({
          type: 'create',
          collection: 'subscriptions',
          documentId: id,
          payload: { ...newSub, userId: useUserStore.getState().uid },
        });
      },

      updateSubscription: (id, updatedSub) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id === id) {
              const newSub = { ...sub, ...updatedSub };
              NotificationService.scheduleSubscriptionReminder(newSub);
              queueForSync({
                type: 'update',
                collection: 'subscriptions',
                documentId: id,
                payload: newSub,
              });
              return newSub;
            }
            return sub;
          }),
        }));
      },

      removeSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
        NotificationService.cancelSubscriptionReminders(id);

        queueForSync({
          type: 'delete',
          collection: 'subscriptions',
          documentId: id,
        });
      },

      archiveSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, isActive: false, isArchived: true } : sub
          ),
        }));
        NotificationService.cancelSubscriptionReminders(id);

        queueForSync({
          type: 'update',
          collection: 'subscriptions',
          documentId: id,
          payload: { isActive: false, isArchived: true },
        });
      },

      toggleSubscriptionActive: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
          ),
        }));

        const current = get().subscriptions.find((s) => s.id === id);
        queueForSync({
          type: 'update',
          collection: 'subscriptions',
          documentId: id,
          payload: { isActive: current ? !current.isActive : true },
        });
      },

      getStats: () => {
        const { subscriptions } = get();
        const activeSubs = subscriptions.filter((s) => s.isActive && !s.isArchived);
        
        let totalMonthly = 0;
        let lifetimeTotal = 0;
        const categoryBreakdown: Record<string, number> = {};
        
        // Calculate Active Stats
        activeSubs.forEach((sub) => {
          // Adjust for Currency and Split-Billing
          const baseAmount = CurrencyService.convertToBase(sub.amount, sub.currency);
          const personalAmount = baseAmount / (sub.sharedWith || 1);
          
          let monthlyAmount = personalAmount;
          if (sub.billingCycle === 'yearly') monthlyAmount = personalAmount / 12;
          if (sub.billingCycle === 'weekly') monthlyAmount = personalAmount * 4.33;
          
          totalMonthly += monthlyAmount;
          categoryBreakdown[sub.category] = (categoryBreakdown[sub.category] || 0) + monthlyAmount;
        });

        // Calculate Lifetime Spend (includes archived)
        subscriptions.forEach((sub) => {
          const baseAmount = CurrencyService.convertToBase(sub.amount, sub.currency);
          const personalAmount = baseAmount / (sub.sharedWith || 1);
          const monthsActive = Math.max(1, differenceInMonths(new Date(), parseISO(sub.startDate)));
          
          let subLifetime = 0;
          if (sub.billingCycle === 'monthly') subLifetime = personalAmount * monthsActive;
          else if (sub.billingCycle === 'yearly') subLifetime = personalAmount * (monthsActive / 12);
          else if (sub.billingCycle === 'weekly') subLifetime = personalAmount * (monthsActive * 4.33);
          
          lifetimeTotal += subLifetime;
        });

        return {
          totalMonthlySpend: totalMonthly,
          totalAnnualSpend: totalMonthly * 12,
          lifetimeSpend: lifetimeTotal,
          upcomingCharges: {
            days7: 0,
            days30: 0,
            days90: 0,
          },
          categoryBreakdown: categoryBreakdown || {},
          burnRate: totalMonthly / 30,
        };
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => kv.getItem(name),
        setItem: (name, value) => kv.setItem(name, value),
        removeItem: (name) => kv.removeItem(name),
      })),
    }
  )
);
