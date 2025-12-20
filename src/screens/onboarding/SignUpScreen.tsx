import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { GlassCard } from '../../components/common/GlassCard';
import { Colors } from '../../theme/colors';
import { useOnboardingStore } from '../../state/client/onboardingStore';
import { useUserStore } from '../../state/client/userStore';
import { onboardingCreateUser } from '../../services/user/api';
import { auth, data } from '../../services/switchboard';

type Props = { navigation: any };

export default function SignUpScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const username = useOnboardingStore((s) => s.onboardingUsername);
  const setHasFinished = useOnboardingStore((s) => s.setHasFinished);
  const setHasStarted = useOnboardingStore((s) => s.setHasStarted);

  const setLoggedIn = useUserStore((s) => s.setLoggedIn);
  const setUid = useUserStore((s) => s.setUid);
  const setUserNameStore = useUserStore((s) => s.setUsername);
  const qc = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [linkedProvider, setLinkedProvider] = useState<string | null>(null);

  const linkProvider = async (provider: 'apple' | 'google') => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setLinkedProvider(provider);
    Toast.show({ type: 'success', text1: t('onboarding.accountLinked', { provider: provider === 'apple' ? 'Apple' : 'Google' }) });
  };

  const doSignUp = async () => {
    try {
      setLoading(true);

      let current = (auth as any).currentUser?.();
      if (!current?.uid && (auth as any).signIn) current = await (auth as any).signIn();
      const theUid = current?.uid ?? 'dev_001';
      setUid(theUid);

      const res = await onboardingCreateUser({ uid: theUid, username: username || 'user' });
      if (!res.success) throw new Error('onboardingCreateUser failed');

      await data.upsertUser({ uid: theUid, username: username || 'user', hasFinishedOnboarding: true, newUser: false });

      setUserNameStore(username || 'user');
      setHasStarted(true);
      setHasFinished(true);
      setLoggedIn(true);

      setLoading(false);
      Toast.show({ type: 'success', text1: t('common.welcome', { name: 'SubSync' }) });

      await qc.invalidateQueries({ queryKey: ['me', theUid] });
    } catch (e) {
      setLoading(false);
      Toast.show({ type: 'error', text1: t('auth.signInFailed'), text2: t('common.error') });
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#0D1117', Colors.background]}
      style={styles.container}
    >
      <StatusBar style='light' />
      <SafeAreaView style={styles.safeArea}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDotActive} />
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText variant="regular" size="sm" color={Colors.text.secondary} uppercase>
              {t('common.step', { current: 3, total: 3 })}
            </AppText>
            <AppText variant="serifBold" size="3xl" style={styles.title}>
              {linkedProvider ? t('onboarding.almostDone') : t('common.welcome', { name: username || 'User' })}
            </AppText>
            <AppText variant="regular" size="base" color={Colors.text.secondary} lineHeight={1.5}>
              {linkedProvider 
                ? t('onboarding.completeSetup')
                : t('onboarding.linkAccount')}
            </AppText>
          </View>

          {!linkedProvider ? (
            <View style={styles.providers}>
              {Platform.OS === 'ios' && (
                <GlassCard noPadding style={styles.providerCard}>
                  <TouchableOpacity 
                    style={styles.providerButton}
                    onPress={() => linkProvider('apple')}
                    disabled={loading}
                  >
                    <View style={styles.providerIcon}>
                      <Ionicons name="logo-apple" size={24} color={Colors.text.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="semibold" size="base">{t('auth.continueApple')}</AppText>
                      <AppText variant="regular" size="sm" color={Colors.text.secondary}>
                        {t('onboarding.recommendedIos')}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </GlassCard>
              )}

              <GlassCard noPadding style={styles.providerCard}>
                <TouchableOpacity 
                  style={styles.providerButton}
                  onPress={() => linkProvider('google')}
                  disabled={loading}
                >
                  <View style={styles.providerIcon}>
                    <Ionicons name="logo-google" size={24} color={Colors.text.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="semibold" size="base">{t('auth.continueGoogle')}</AppText>
                    <AppText variant="regular" size="sm" color={Colors.text.secondary}>
                      {t('onboarding.worksOnAll')}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </GlassCard>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <AppText variant="regular" size="sm" color={Colors.text.tertiary} style={styles.dividerText}>
                  {t('common.or')}
                </AppText>
                <View style={styles.divider} />
              </View>

              <AppButton
                title={t('common.skip')}
                onPress={() => setLinkedProvider('skip')}
                variant="outline"
              />
            </View>
          ) : (
            <View style={styles.confirmContainer}>
              <GlassCard variant="accent" style={styles.confirmCard}>
                <View style={styles.confirmContent}>
                  <View style={styles.confirmIconContainer}>
                    <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
                  </View>
                  <AppText variant="semibold" size="lg" align="center" style={{ marginTop: 16 }}>
                    {linkedProvider === 'skip' ? t('onboarding.guestMode') : t('onboarding.accountLinked', { provider: linkedProvider === 'apple' ? 'Apple' : 'Google' })}
                  </AppText>
                  <AppText variant="regular" size="sm" color={Colors.text.secondary} align="center" style={{ marginTop: 8 }}>
                    {linkedProvider === 'skip' 
                      ? t('onboarding.localData')
                      : t('onboarding.backupData')}
                  </AppText>
                </View>
              </GlassCard>
            </View>
          )}
        </View>

        {/* Footer */}
        {linkedProvider && (
          <View style={styles.footer}>
            <AppButton
              title={t('settings.title')} 
              onPress={doSignUp}
              loading={loading}
              size="lg"
            />
            <AppText 
              variant="regular" 
              size="xs" 
              color={Colors.text.tertiary} 
              align="center"
              style={{ marginTop: 16 }}
            >
              {t('onboarding.terms')}
            </AppText>
          </View>
        )}
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
  },
  providers: {},
  providerCard: {
    marginBottom: 12,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
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
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  confirmContainer: {
    marginTop: 20,
  },
  confirmCard: {
    padding: 32,
  },
  confirmContent: {
    alignItems: 'center',
  },
  confirmIconContainer: {},
  footer: {
    paddingBottom: 32,
  },
});
