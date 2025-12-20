import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { useOnboardingStore } from '../../state/client/onboardingStore';

const { width, height } = Dimensions.get('window');

type Props = { navigation: { navigate: (route: string) => void } };

export default function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const setHasStarted = useOnboardingStore((s) => s.setHasStarted);

  const handleGetStarted = () => {
    setHasStarted(true);
    navigation.navigate('Username');
  };

  return (
    <LinearGradient
      colors={[colors.background, isDark ? '#0D1117' : '#FFFFFF', colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={colors.gradient.premium as unknown as [string, string, ...string[]]}
              style={styles.logoGradient}
            >
              <Ionicons name="wallet-outline" size={48} color={colors.text.inverse} />
            </LinearGradient>
          </View>
          
          <AppText variant="serifBold" size="4xl" align="center" style={styles.title}>
            SubSync
          </AppText>
          
          <AppText 
            variant="regular" 
            size="lg" 
            color={colors.text.secondary} 
            align="center"
            lineHeight={1.5}
            style={styles.subtitle}
          >
            {t('landing.subtitle') || 'Take control of your subscriptions.\nSee where your money goes.'}
          </AppText>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <FeatureItem 
            icon="analytics-outline" 
            title={t('landing.feature1_title') || 'Smart Analytics'} 
            description={t('landing.feature1_desc') || 'Visualize spending patterns'} 
            color={colors.accent}
            mutedColor={colors.accentMuted}
          />
          <FeatureItem 
            icon="notifications-outline" 
            title={t('landing.feature2_title') || 'Renewal Alerts'} 
            description={t('landing.feature2_desc') || 'Never miss a billing date'} 
            color={colors.accent}
            mutedColor={colors.accentMuted}
          />
          <FeatureItem 
            icon="shield-checkmark-outline" 
            title={t('landing.feature3_title') || 'Privacy First'} 
            description={t('landing.feature3_desc') || 'Your data stays on device'} 
            color={colors.accent}
            mutedColor={colors.accentMuted}
          />
        </View>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <AppButton
            title={t('landing.getStarted') || 'Get Started'}
            onPress={handleGetStarted}
            size="lg"
            variant="primary"
          />
          
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <AppText variant="medium" size="base" color={colors.text.secondary}>
              {t('landing.alreadyHaveAccount') || 'Already have an account? '} 
              <AppText variant="semibold" color={colors.accent}>{t('common.signIn') || 'Sign In'}</AppText>
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const FeatureItem = ({ icon, title, description, color, mutedColor }: any) => {
  const { colors } = useTheme();
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: mutedColor }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.featureText}>
        <AppText variant="semibold" size="base">{title}</AppText>
        <AppText variant="regular" size="sm" color={colors.text.secondary}>{description}</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    paddingHorizontal: 20,
  },
  features: {
    paddingVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  ctaContainer: {
    paddingBottom: 40,
  },
  signInButton: {
    marginTop: 20,
    alignItems: 'center',
  },
});
