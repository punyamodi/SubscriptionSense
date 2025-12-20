
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import { useUserStore } from '../../state/client/userStore';

export const firebaseAuth = {
  signIn: async () => {
    const auth = getAuth();
    const res = await signInAnonymously(auth);
    // UserStore is usually updated via the listener in App.tsx
    return { uid: res.user.uid };
  },

  getAnonymousUid: async () => {
    const auth = getAuth();
    if (auth.currentUser) return { uid: auth.currentUser.uid };
    const res = await signInAnonymously(auth);
    return { uid: res.user.uid };
  },

  signOut: async () => {
    const auth = getAuth();
    await fbSignOut(auth);
  },

  deleteUser: async () => {
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  },

  currentUser: () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const { isLoggedIn } = useUserStore.getState();
    return (user && isLoggedIn) ? { uid: user.uid, email: user.email } : null;
  },

  listen: (fn: (user: any) => void) => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      const { isLoggedIn } = useUserStore.getState();
      if (user && isLoggedIn) {
        fn({ uid: user.uid, email: user.email });
      } else if (user) {
        // User is authenticated but maybe not "logged in" in app terms (onboarding)
        // We'll let the app state handle it
        fn(null); 
      } else {
        fn(null);
      }
    });
  }
};
