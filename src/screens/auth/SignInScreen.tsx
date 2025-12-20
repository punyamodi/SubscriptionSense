import React, { useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { GlassCard } from '../../components/common/GlassCard';
import { useUserStore } from '../../state/client/userStore';
import { useOnboardingStore } from '../../state/client/onboardingStore';
import { auth, data } from '../../services/switchboard';
import { useUpsertUser } from '../../services/user/queries';

type Props = { navigation: any };

export default function SignInScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { setUid, setLoggedIn, setNewUser } = useUserStore();
  const username = useUserStore((s) => s.username);
  const setHasFinishedOnboarding = useOnboardingStore((s) => s.setHasFinished);
  const upsert = useUpsertUser();

  const doProviderSignIn = useCallback(async (provider: 'apple' | 'google' | 'guest') => {
    try {
      const res = await (auth as any).signIn?.();
      const signedUid = res?.uid ?? 'dev_001';
      setUid(signedUid);
      setLoggedIn(true);
      setNewUser(false);
      setHasFinishedOnboarding(true);

      try {
        await upsert.mutateAsync({ 
          uid: signedUid, 
          username: username || 'User', 
          isLoggedIn: true, 
          newUser: false,
          hasFinishedOnboarding: true
        });
      } catch (e) {
        console.warn('User upsert failed:', e);
      }

      Toast.show({ type: 'success', text1: t('auth.welcomeBack') || 'Welcome Back!' });
    } catch (e) {
      console.error('Sign-in error:', e);
      Toast.show({ type: 'error', text1: t('auth.signInFailed') || 'Sign-in failed' });
    }
  }, [setUid, setLoggedIn, setNewUser, upsert, username, setHasFinishedOnboarding, t]);

  return (
    <LinearGradient
      colors={[colors.background, isDark ? '#0D1117' : '#FFFFFF', colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Back Button */}
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={colors.gradient.premium as unknown as [string, string, ...string[]]}
                style={styles.logoGradient}
              >
                <Ionicons name="wallet-outline" size={36} color={colors.text.inverse} />
              </LinearGradient>
            </View>
            
            <AppText variant="serifBold" size="3xl" align="center" style={styles.title}>
              {t('auth.welcomeBack') || 'Welcome Back'}
            </AppText>
            
            <AppText 
              variant="regular" 
              size="base" 
              color={colors.text.secondary} 
              align="center"
            >
              {t('auth.signInSub') || 'Sign in to sync your subscriptions'}
            </AppText>
          </View>

          {/* Sign In Options */}
          <View style={styles.signInOptions}>
            {Platform.OS === 'ios' && (
              <GlassCard noPadding style={styles.providerCard}>
                <TouchableOpacity 
                  style={styles.providerButton}
                  onPress={() => doProviderSignIn('apple')}
                >
                  <View style={[styles.providerIcon, { backgroundColor: colors.surfaceLight }]}>
                    <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
                  </View>
                  <AppText variant="semibold" size="base">{t('auth.continueApple') || 'Continue with Apple'}</AppText>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </GlassCard>
            )}

            <GlassCard noPadding style={styles.providerCard}>
              <TouchableOpacity 
                style={styles.providerButton}
                onPress={() => doProviderSignIn('google')}
              >
                <View style={[styles.providerIcon, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="logo-google" size={24} color={colors.text.primary} />
                </View>
                <AppText variant="semibold" size="base">{t('auth.continueGoogle') || 'Continue with Google'}</AppText>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </GlassCard>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <AppText variant="regular" size="sm" color={colors.text.tertiary} style={styles.dividerText}>
                {t('common.or') || 'or'}
              </AppText>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <AppButton
              title={t('auth.continueGuest') || 'Continue as Guest'}
              onPress={() => doProviderSignIn('guest')}
              variant="outline"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Landing')} style={{ marginBottom: 24 }}>
            <AppText variant="medium" size="sm" color={colors.text.secondary}>
              {t('auth.noAccount') || "Don't have an account? "} 
              <AppText variant="semibold" color={colors.accent}>{t('common.signUp') || 'Sign Up'}</AppText>
            </AppText>
          </TouchableOpacity>

          <View style={styles.legalRow}>
            <AppText variant="regular" size="xs" color={colors.text.tertiary}>
              By continuing, you agree to our{' '}
            </AppText>
            <TouchableOpacity onPress={() => Linking.openURL('https://subsync.app/terms')}>
              <AppText variant="medium" size="xs" color={colors.text.secondary}>Terms</AppText>
            </TouchableOpacity>
            <AppText variant="regular" size="xs" color={colors.text.tertiary}> & </AppText>
            <TouchableOpacity onPress={() => Linking.openURL('https://subsync.app/privacy')}>
              <AppText variant="medium" size="xs" color={colors.text.secondary}>Privacy Policy</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  signInOptions: {},
  providerCard: {
    marginBottom: 12,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
