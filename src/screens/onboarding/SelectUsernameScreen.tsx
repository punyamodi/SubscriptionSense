import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../state/client/onboardingStore';
import { useUserStore } from '../../state/client/userStore';
import { auth, data } from '../../services/switchboard';
import { checkUsernameAvailable, reserveUsername } from '../../services/user/api';
import { useForm, Controller } from 'react-hook-form';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

type Props = { navigation: any };
type FormValues = { username: string };

export default function SelectUsernameScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const onboardingUsername = useOnboardingStore((s) => s.onboardingUsername);
  const setOnboardingUsername = useOnboardingStore((s) => s.setOnboardingUsername);
  const setHasStarted = useOnboardingStore((s) => s.setHasStarted);

  const setUidStore = useUserStore((s) => s.setUid);
  const setUsernameStore = useUserStore((s) => s.setUsername);

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { username: '' }
  });
  const username = watch('username');

  useEffect(() => {
    if (onboardingUsername) setValue('username', onboardingUsername);
  }, [setValue, onboardingUsername]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkAvailability = (value: string) => {
    const v = value.toLowerCase().trim();
    if (!v || v.length < 2 || v.length > 21) {
      setUsernameAvailable(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsChecking(true);
    debounceRef.current = setTimeout(async () => {
      const ok = await checkUsernameAvailable(v);
      setUsernameAvailable(ok);
      setIsChecking(false);
    }, 400);
  };

  const onSubmit = async (form: FormValues) => {
    const uname = form.username.trim();
    if (!usernameAvailable) return;

    let current = (auth as any).currentUser?.();
    if (!current?.uid && (auth as any).getAnonymousUid) {
      try { current = await (auth as any).getAnonymousUid(); } catch { }
    }
    const uid = current?.uid ?? 'dev_001';

    await reserveUsername(uid, uname);
    await data.upsertUser({ uid, username: uname, hasFinishedOnboarding: false, newUser: true, isLoggedIn: true });

    setOnboardingUsername(uname);
    setUsernameStore(uname);
    setUidStore(uid);
    setHasStarted(true);

    navigation.navigate('Preferences');
  };

  const isValid = username.length >= 2 && username.length <= 21 && usernameAvailable && !errors.username;

  return (
    <LinearGradient
      colors={[Colors.background, '#0D1117', Colors.background]}
      style={styles.container}
    >
      <StatusBar style='light' />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safeArea}>
            {/* Progress Indicator */}
            <View style={styles.progress}>
              <View style={styles.progressDotActive} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <AppText variant="regular" size="sm" color={Colors.text.secondary} uppercase>
                  {t('common.step', { current: 1, total: 3 })}
                </AppText>
                <AppText variant="serifBold" size="3xl" style={styles.title}>
                  {t('onboarding.profileTitle')}
                </AppText>
                <AppText variant="regular" size="base" color={Colors.text.secondary} lineHeight={1.5}>
                  {t('onboarding.profileDesc')}
                </AppText>
              </View>

              {/* Input */}
              <View style={styles.inputContainer}>
                <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
                  {t('onboarding.username')}
                </AppText>
                <Controller
                  control={control}
                  rules={{
                    required: true,
                    minLength: 2,
                    maxLength: 21,
                    pattern: /^[a-zA-Z0-9_]+$/
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder={t('onboarding.usernamePlaceholder')}
                        placeholderTextColor={Colors.text.tertiary}
                        onBlur={(e) => {
                          onBlur();
                          checkAvailability(value);
                        }}
                        onChangeText={(text) => {
                          onChange(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          checkAvailability(text);
                        }}
                        value={value}
                      />
                      {value.length > 0 && (
                        <View style={styles.inputStatus}>
                          {isChecking ? (
                            <Ionicons name="hourglass-outline" size={20} color={Colors.text.tertiary} />
                          ) : usernameAvailable ? (
                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                          ) : usernameAvailable === false ? (
                            <Ionicons name="close-circle" size={20} color={Colors.error} />
                          ) : null}
                        </View>
                      )}
                    </View>
                  )}
                  name="username"
                />

                {/* Validation Messages */}
                <View style={styles.validation}>
                  <View style={styles.validationRow}>
                    <Ionicons 
                      name={username.length >= 2 && username.length <= 21 ? "checkmark-circle" : "ellipse-outline"} 
                      size={14} 
                      color={username.length >= 2 && username.length <= 21 ? Colors.success : Colors.text.tertiary} 
                    />
                    <AppText 
                      variant="regular" 
                      size="sm" 
                      color={username.length >= 2 && username.length <= 21 ? Colors.success : Colors.text.secondary}
                      style={{ marginLeft: 8 }}
                    >
                      {t('onboarding.usernameChars')}
                    </AppText>
                  </View>
                  <View style={styles.validationRow}>
                    <Ionicons 
                      name={/^[a-zA-Z0-9_]*$/.test(username) ? "checkmark-circle" : "ellipse-outline"} 
                      size={14} 
                      color={/^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? Colors.success : Colors.text.tertiary} 
                    />
                    <AppText 
                      variant="regular" 
                      size="sm" 
                      color={/^[a-zA-Z0-9_]*$/.test(username) && username.length > 0 ? Colors.success : Colors.text.secondary}
                      style={{ marginLeft: 8 }}
                    >
                      {t('onboarding.usernameRules')}
                    </AppText>
                  </View>
                  {username.length >= 2 && usernameAvailable !== null && (
                    <View style={styles.validationRow}>
                      <Ionicons 
                        name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={usernameAvailable ? Colors.success : Colors.error} 
                      />
                      <AppText 
                        variant="regular" 
                        size="sm" 
                        color={usernameAvailable ? Colors.success : Colors.error}
                        style={{ marginLeft: 8 }}
                      >
                        {usernameAvailable ? t('onboarding.usernameAvailable') : t('onboarding.usernameTaken')}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <AppButton
                title={t('common.continue')}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                size="lg"
              />
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 10,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    color: Colors.text.primary,
    fontFamily: Fonts.SansMedium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputStatus: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  validation: {
    marginTop: 16,
    gap: 8,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 32,
  },
});
