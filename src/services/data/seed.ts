import { useUserStore } from '../../state/client/userStore';
import { Subscription } from '../../types/subscription';

type UserDoc = { uid: string; username: string; hasFinishedOnboarding?: boolean; newUser?: boolean; isLoggedIn?: boolean; email?: string };

type DbShape = {
  users: Record<string, UserDoc>;
  subscriptions: Record<string, Subscription[]>;
};

const _db: DbShape = {
  users: { dev_001: { uid: 'dev_001', username: 'DevUser', hasFinishedOnboarding: false, newUser: true, isLoggedIn: false } },
  subscriptions: {
    dev_001: [
      {
        id: 'demo-netflix',
        name: 'Netflix',
        category: 'Streaming',
        amount: 12.99,
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: new Date().toISOString(),
        nextRenewalDate: new Date().toISOString(),
        paymentMethod: 'Visa',
        isActive: true,
        isArchived: false,
        sharedWith: 1,
      },
    ],
  },
};

export const seedData = {
  getUser: async (uid: string) => _db.users[uid] ?? null,
  upsertUser: async (doc: UserDoc) => { _db.users[doc.uid] = { ..._db.users[doc.uid], ...doc }; },
  me: async (uid: string) => (uid ? _db.users[uid] ?? null : null),
  getSubscriptions: async (uid: string) => _db.subscriptions[uid] ?? [],
  addSubscription: async (uid: string, sub: Subscription) => {
    if (!_db.subscriptions[uid]) _db.subscriptions[uid] = [];
    _db.subscriptions[uid].push({ ...sub, isArchived: sub.isArchived ?? false, isActive: sub.isActive ?? true });
  },
  updateSubscription: async (uid: string, id: string, sub: Partial<Subscription>) => {
    _db.subscriptions[uid] = (_db.subscriptions[uid] ?? []).map(s => s.id === id ? { ...s, ...sub } : s);
  },
  deleteSubscription: async (uid: string, id: string) => {
    _db.subscriptions[uid] = (_db.subscriptions[uid] ?? []).filter(s => s.id !== id);
  },
  getAppConfig: async () => ({
    latestVersion: '2.1.0', // Simulating a new version is available for the demo
    minRequiredVersion: '1.0.0',
    updateUrl: 'https://expo.dev/artifacts/your-app-id',
    releaseNotes: 'Performance improvements and new localization support!',
    isCritical: false
  }),
};

// Recreate an in-memory doc from the persisted store so `useMe(uid)` matches on reloads.
export function hydrateSeedFromStore() {
  const s = useUserStore.getState();
  if (!s.uid) return;
  _db.users[s.uid] = {
    uid: s.uid,
    username: s.username ?? 'User',
    hasFinishedOnboarding: s.newUser ? false : true, // infer if you like
    newUser: s.newUser ?? true,
    isLoggedIn: s.isLoggedIn ?? false,
    email: s.email ?? undefined,
  }
}
