// App.tsx
import './src/config/gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/app/AppNavigator';
import AssetsBootstrap from './src/app/AssetsBootstrap';
import { queryClient } from './src/state/server/queryClient';
import FontProvider from './src/theme/FontProvider';
import Toast from 'react-native-toast-message';
import { auth } from './src/services/switchboard';
import { useUserStore } from './src/state/client/userStore';
import { hydrateSeedFromStore } from './src/services/data/seed';
import { runtime } from './src/config/runtime';
import { Colors } from './src/theme/colors';
import { AdService } from './src/services/ad.service';
import { initFirebase } from './src/services/firebase/init';
import { useVersionCheck } from './src/hooks/useVersionCheck';
import { VersionUpdateModal } from './src/components/modals/VersionUpdateModal';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useBackgroundSync } from './src/services/data/sync.service';
import { useSubscriptionBootstrap } from './src/services/data/subscriptionSync';
import { isFeatureEnabled } from './src/config/features';

// Initialize Firebase
initFirebase();

// Mount once to mirror adapter auth state into Zustand
function AuthSync() {
  useEffect(() => {
    const unsub = (auth as any).listen?.((u: any) => {
      const state = useUserStore.getState();
      if (u?.uid) {
        state.setUid(u.uid);
        state.setLoggedIn(true);
      } else {
        // Only clear state if we WERE logged in, or if there is no pending onboarding UID
        // This prevents erasing the UID set during SelectUsernameScreen
        if (state.isLoggedIn) {
          state.setLoggedIn(false);
          state.setUid(null);
        }
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);
  return null;
}

function SeedHydrator() {
  useEffect(() => {
    if (runtime.DATA_MODE === 'seed') hydrateSeedFromStore();
  }, []);
  return null;
}

// Initialize AdMob (non-blocking)
function AdInitializer() {
  useEffect(() => {
    AdService.initialize().then(success => {
      if (success) {
        console.log('AdMob initialized successfully');
      }
    }).catch(err => {
      console.warn('AdMob initialization failed:', err);
    });
  }, []);
  return null;
}

import i18n from './src/i18n';
import { usePreferencesStore } from './src/state/client/preferencesStore';
import { ThemeProvider } from './src/theme/ThemeContext';
import { I18nextProvider } from 'react-i18next';

function LanguageSync() {
  const language = usePreferencesStore(s => s.language);
  
  useEffect(() => {
    console.log(`LanguageSync: detected store language as ${language}`);
    if (i18n.language !== language) {
      console.log(`LanguageSync: changing i18n language to ${language}`);
      i18n.changeLanguage(language);
    }
  }, [language]);
  return null;
}

function VersionCheck() {
  const { showModal, setShowModal, updateInfo } = useVersionCheck();

  if (!updateInfo) return null;

  return (
    <VersionUpdateModal
      visible={showModal}
      onClose={() => setShowModal(false)}
      latestVersion={updateInfo.latestVersion}
      releaseNotes={updateInfo.releaseNotes}
      updateUrl={updateInfo.updateUrl}
      isCritical={updateInfo.isCritical}
    />
  );
}

function BackgroundSync() {
  useBackgroundSync();
  return null;
}

function SubscriptionBootstrapper() {
  useSubscriptionBootstrap();
  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <SafeAreaProvider>
              <ThemeProvider>
                <LanguageSync />
                <AssetsBootstrap holdSplash />
                <AuthSync />
                <SeedHydrator />
                {isFeatureEnabled('ads') && <AdInitializer />}
                <SubscriptionBootstrapper />
                {isFeatureEnabled('backgroundSync') && <BackgroundSync />}
                <View style={styles.container}>
                  <StatusBar style="auto" />
                  <AppNavigator />
                  {isFeatureEnabled('versionCheck') && <VersionCheck />}
                  <Toast topOffset={60} />
                </View>
              </ThemeProvider>
            </SafeAreaProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </FontProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    width: '100%',
  },
});
