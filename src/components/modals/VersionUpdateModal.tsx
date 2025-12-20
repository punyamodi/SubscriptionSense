import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { GlassCard } from '../common/GlassCard';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

interface VersionUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  latestVersion: string;
  releaseNotes?: string;
  updateUrl?: string;
  isCritical?: boolean;
}

export const VersionUpdateModal = ({
  visible,
  onClose,
  latestVersion,
  releaseNotes,
  updateUrl,
  isCritical = false
}: VersionUpdateModalProps) => {
  const { t } = useTranslation();

  const handleUpdate = async () => {
    // Default store URLs if none provided
    const defaultStoreUrl = Platform.select({
      ios: 'https://apps.apple.com/app/subsync',
      android: 'https://play.google.com/store/apps/details?id=com.subsync.app',
      default: 'https://subsync.app'
    });

    const targetUrl = updateUrl || defaultStoreUrl;

    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      if (canOpen) {
        await Linking.openURL(targetUrl);
      } else {
        // If the URL is formatted for a deep link but failed, try a web link
        Linking.openURL('https://subsync.app/download');
      }
    } catch (error) {
      console.warn('Failed to open update URL:', error);
      // Last resort fallback
      Linking.openURL('https://subsync.app');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={isCritical ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <Animated.View 
          entering={ZoomIn.duration(400).springify()}
          style={styles.container}
        >
          <GlassCard variant="accent" style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="rocket-outline" size={32} color={Colors.accent} />
              </View>
              {isCritical && (
                <View style={styles.criticalBadge}>
                  <AppText variant="semibold" size="xs" color="#FFF">REQUIRED</AppText>
                </View>
              )}
            </View>

            <AppText variant="serifBold" size="2xl" align="center" style={styles.title}>
              New Version Available!
            </AppText>
            
            <AppText variant="medium" size="base" color={Colors.text.secondary} align="center">
              Version {latestVersion} is now ready.
            </AppText>

            {releaseNotes && (
              <View style={styles.notesContainer}>
                <AppText variant="semibold" size="sm" color={Colors.text.tertiary} uppercase style={styles.notesLabel}>
                  What's New
                </AppText>
                <AppText variant="regular" size="sm" color={Colors.text.primary} lineHeight={1.4}>
                  {releaseNotes}
                </AppText>
              </View>
            )}

            <View style={styles.footer}>
              <AppButton
                title="Update Now"
                onPress={handleUpdate}
                size="lg"
                variant="primary"
              />
              
              {!isCritical && (
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.maybeLater}
                >
                  <AppText variant="medium" size="sm" color={Colors.text.tertiary}>
                    Maybe Later
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(126, 207, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(126, 207, 163, 0.3)',
  },
  criticalBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  title: {
    marginBottom: 8,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  notesLabel: {
    marginBottom: 8,
    letterSpacing: 1,
  },
  footer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  maybeLater: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
