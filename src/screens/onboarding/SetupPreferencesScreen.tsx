import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { GlassCard } from '../../components/common/GlassCard';
import { Colors } from '../../theme/colors';
import { usePreferencesStore, LANGUAGES, CURRENCIES } from '../../state/client/preferencesStore';
import { Spacing, BorderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = { navigation: any };

export default function SetupPreferencesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { language, setLanguage, currency, setCurrency } = usePreferencesStore();

  const handleContinue = () => {
    navigation.navigate('SignUp');
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
          <View style={styles.progressDotActive} />
          <View style={styles.progressDot} />
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <AppText variant="regular" size="sm" color={Colors.text.secondary} uppercase>
              {t('common.step', { current: 2, total: 3 })}
            </AppText>
            <AppText variant="serifBold" size="3xl" style={styles.title}>
              {t('settings.preferences')}
            </AppText>
            <AppText variant="regular" size="base" color={Colors.text.secondary} lineHeight={1.5}>
              Select your preferred language and default currency for tracking your subscriptions.
            </AppText>
          </View>

          {/* Language Selection */}
          <View style={styles.section}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.sectionLabel}>
              {t('settings.language')}
            </AppText>
            <View style={styles.grid}>
              {LANGUAGES.slice(0, 6).map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.gridItem,
                    language === lang.code && styles.gridItemActive
                  ]}
                  onPress={() => setLanguage(lang.code as any)}
                >
                  <AppText 
                    variant="medium" 
                    size="base" 
                    color={language === lang.code ? Colors.text.inverse : Colors.text.primary}
                  >
                    {lang.nativeName}
                  </AppText>
                  <AppText 
                    variant="regular" 
                    size="xs" 
                    color={language === lang.code ? 'rgba(255,255,255,0.7)' : Colors.text.tertiary}
                  >
                    {lang.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Currency Selection */}
          <View style={styles.section}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.sectionLabel}>
              {t('settings.currency')}
            </AppText>
            <View style={styles.grid}>
              {CURRENCIES.slice(0, 6).map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.gridItem,
                    currency === curr.code && styles.gridItemActive
                  ]}
                  onPress={() => setCurrency(curr.code as any)}
                >
                  <AppText 
                    variant="serifBold" 
                    size="lg" 
                    color={currency === curr.code ? Colors.text.inverse : Colors.primary}
                  >
                    {curr.symbol}
                  </AppText>
                  <AppText 
                    variant="medium" 
                    size="sm" 
                    color={currency === curr.code ? Colors.text.inverse : Colors.text.primary}
                  >
                    {curr.code}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <AppButton
            title={t('common.continue')}
            onPress={handleContinue}
            size="lg"
          />
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 48 - 24) / 3,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gridItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    paddingBottom: 32,
    marginTop: 'auto',
  },
});
