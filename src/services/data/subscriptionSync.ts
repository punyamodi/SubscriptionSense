import { useEffect, useRef } from 'react';
import { useUserStore } from '../../state/client/userStore';
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { data } from '../switchboard';
import { isLive } from '../../config/runtime';

// Hydrate local subscription store from the backend when live mode is enabled
export function useSubscriptionBootstrap() {
  const uid = useUserStore((s) => s.uid);
  const setSubscriptions = useSubscriptionStore((s) => s.setSubscriptions);
  const setLoaded = useSubscriptionStore((s) => s.setLoaded);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);
  const lastUid = useRef<string | null>(null);

  useEffect(() => {
    if (uid && uid !== lastUid.current) {
      setLoaded(false);
      lastUid.current = uid;
    }

    if (isLoaded) return;
    if (!isLive) {
      setLoaded(true);
      return;
    }
    if (!uid) return;

    let isMounted = true;
    (async () => {
      try {
        const subs = await data.getSubscriptions(uid);
        if (isMounted && subs) {
          setSubscriptions(subs as any);
        }
      } catch (error) {
        console.warn('Subscription bootstrap failed:', error);
      } finally {
        if (isMounted) setLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [uid, isLoaded, setLoaded, setSubscriptions]);
}
