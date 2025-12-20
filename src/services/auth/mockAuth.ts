import { useUserStore } from '../../state/client/userStore';

type AuthListener = (user: { uid: string } | null) => void;

let _listeners: AuthListener[] = [];

export const mockAuth = {
  signIn: async () => {
    useUserStore.getState().setUid('dev_001');
    useUserStore.getState().setUsername('DevUser');
    useUserStore.getState().setLoggedIn(true);
    _listeners.forEach(fn => fn({ uid: 'dev_001' }));
    return { uid: 'dev_001' };
  },
  getAnonymousUid: async () => {
    // Just returns a UID without logging in globally
    return { uid: 'dev_001' };
  },
  signOut: async () => {
    useUserStore.getState().setLoggedIn(false);
    useUserStore.getState().setUid(null);
    _listeners.forEach(fn => fn(null));
  },
  deleteUser: async () => {
    useUserStore.getState().setLoggedIn(false);
    useUserStore.getState().setUid(null);
    _listeners.forEach(fn => fn(null));
    console.log('Mock user deleted');
  },
  currentUser: () => {
    const { uid, username, isLoggedIn } = useUserStore.getState() as any;
    return (uid && isLoggedIn) ? { uid, username } : null;
  },
  listen: (fn: AuthListener) => {
    _listeners.push(fn);
    // Immediately fire with current state
    const current = mockAuth.currentUser();
    fn(current);
    return () => {
      _listeners = _listeners.filter(l => l !== fn);
    };
  },
};
