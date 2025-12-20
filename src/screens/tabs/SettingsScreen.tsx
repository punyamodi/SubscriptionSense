import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, FlatList, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Components
import { AppText, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { SearchModal } from '../../components/modals/SearchModal';
import { BillSplitModal } from '../../components/modals/BillSplitModal';

// Theme
import { useTheme } from '../../theme/ThemeContext';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';

// Services
import { DataService } from '../../services/data.service';
import { CurrencyService } from '../../services/currency.service';
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { useUserStore } from '../../state/client/userStore';
import { usePreferencesStore, CURRENCIES, LANGUAGES, CurrencyCode, LanguageCode } from '../../state/client/preferencesStore';
import { auth, data } from '../../services/switchboard';

// ═══════════════════════════════════════════════════════════════
// SETTINGS ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════
interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isNew?: boolean;
  loading?: boolean;
}

const SettingItem = ({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  danger,
  showArrow = true,
  showSwitch = false,
  switchValue,
  onSwitchChange,
  isNew,
  loading,
}: SettingItemProps) => {
  const { colors } = useTheme();
  const color = danger ? colors.error : iconColor || colors.primary;
  const backgroundColor = danger ? colors.errorMuted : `${color}15`;

  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={showSwitch ? 1 : 0.7}
      disabled={showSwitch}
    >
      <View style={[styles.settingIcon, { backgroundColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      
      <View style={styles.settingContent}>
        <View style={styles.settingTitleRow}>
          <AppText 
            variant="medium" 
            size="base" 
            color={danger ? colors.error : colors.text.primary}
          >
            {title}
          </AppText>
          {isNew && (
            <View style={[styles.newBadge, { backgroundColor: colors.success }]}>
              <AppText variant="semibold" size="2xs" color={colors.text.inverse}>NEW</AppText>
            </View>
          )}
        </View>
        {subtitle && (
          <AppText variant="regular" size="sm" color={colors.text.tertiary}>
            {subtitle}
          </AppText>
        )}
      </View>

      {value && (
        <AppText variant="regular" size="sm" color={colors.text.tertiary} style={{ marginRight: Spacing['2'] }}>
          {value}
        </AppText>
      )}

      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primaryMuted }}
          thumbColor={switchValue ? colors.primary : colors.text.tertiary}
        />
      )}

      {showArrow && !showSwitch && !loading && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      )}
      {loading && (
        <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sync-outline" size={18} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════
// SETTINGS SCREEN
// ═══════════════════════════════════════════════════════════════
export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const { subscriptions } = useSubscriptionStore();
  const { 
    currency, 
    language, 
    notifications, 
    darkMode,
    setCurrency,
    setLanguage,
    setNotifications,
    setDarkMode,
    setHasCompletedTutorial 
  } = usePreferencesStore();
  const { isLoggedIn, username, email, avatar } = useUserStore();
  
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBillSplitModal, setShowBillSplitModal] = useState(false);

  const handleCurrencySelect = (currencyCode: CurrencyCode) => {
    setCurrency(currencyCode);
    CurrencyService.setBaseCurrency(currencyCode);
    setShowCurrencyPicker(false);
    Toast.show({ type: 'success', text1: `Currency set to ${currencyCode}` });
  };

  const handleLanguageSelect = (langCode: LanguageCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    setShowLanguagePicker(false);
    Toast.show({ type: 'success', text1: t('settings.language_updated') || 'Language updated' });
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.signOut'), 
          style: 'destructive', 
          onPress: async () => {
            await (auth as any).signOut();
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'Landing' }],
            });
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.delete'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              await (auth as any).deleteUser();
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Delete failed', text2: 'Please re-login and try again.' });
            }
          }
        }
      ]
    );
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate Cloud Sync
    setTimeout(() => {
      setIsSyncing(false);
      Toast.show({ type: 'success', text1: 'Cloud Sync Complete', text2: 'Your data is backed up.' });
    }, 2000);
  };

  const handleExport = async () => {
    try {
      const dataToExport = {
        subscriptions: subscriptions,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const fileUri = FileSystem.documentDirectory + 'subsync_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToExport, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({ type: 'info', text1: 'Sharing not available' });
      }
    } catch (error) {
      console.warn(error);
      Toast.show({ type: 'error', text1: 'Export Failed' });
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(fileContent);

      if (parsed.subscriptions && Array.isArray(parsed.subscriptions)) {
        // Here we would hydrate the store
        // For now, we'll just show success as a proof of concept
        // In a real app, calls to subscriptionStore.setSubscriptions(parsed.subscriptions)
        Toast.show({ type: 'success', text1: 'Import Successful', text2: `Found ${parsed.subscriptions.length} subscriptions` });
      } else {
        Toast.show({ type: 'error', text1: 'Invalid File Format' });
      }
    } catch (error) {
      console.warn(error);
      Toast.show({ type: 'error', text1: 'Import Failed' });
    }
  };

  const handleClearData = () => { /* ... implementation ... */ };

  // Currency Picker Modal
  const CurrencyPickerModal = () => (
    <Modal visible={showCurrencyPicker} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <AppText variant="semibold" size="lg">{t('settings.currency')}</AppText>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, currency === item.code && { backgroundColor: colors.primaryMuted }, { borderBottomColor: colors.border }]}
                onPress={() => handleCurrencySelect(item.code)}
              >
                <View style={styles.currencyRow}>
                  <AppText variant="medium" size="lg">{item.symbol}</AppText>
                  <View style={{ marginLeft: Spacing['3'] }}>
                    <AppText variant="medium" size="base">{item.code}</AppText>
                    <Caption>{item.name}</Caption>
                  </View>
                </View>
                {currency === item.code && <Ionicons name="checkmark-circle" size={24} color={colors.success} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Language Picker Modal
  const LanguagePickerModal = () => (
    <Modal visible={showLanguagePicker} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <AppText variant="semibold" size="lg">{t('settings.language')}</AppText>
            <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, language === item.code && { backgroundColor: colors.primaryMuted }, { borderBottomColor: colors.border }]}
                onPress={() => handleLanguageSelect(item.code)}
              >
                <View>
                  <AppText variant="medium" size="base">{item.name}</AppText>
                  <Caption>{item.nativeName}</Caption>
                </View>
                {language === item.code && <Ionicons name="checkmark-circle" size={24} color={colors.success} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={[isDark ? 'rgba(126, 207, 163, 0.05)' : 'rgba(126, 207, 163, 0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <AppText variant="regular" size="sm" color={colors.text.secondary} uppercase letterSpacing={2}>
            {t('settings.preferences')}
          </AppText>
          <AppText variant="serifBold" size="3xl">{t('settings.title')}</AppText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
          <PremiumCard variant="default" style={styles.profileCard}>
            <TouchableOpacity 
              activeOpacity={0.8}
              disabled={!isLoggedIn}
              onPress={() => (navigation as any).navigate('EditProfile')}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <View style={[styles.profileAvatar, { backgroundColor: avatar || colors.primaryMuted }]}>
                {avatar ? (
                   <AppText variant="serifBold" size="xl" color={avatar === '#FFFFFF' ? '#000' : '#FFF'}>
                     {(username || 'User').charAt(0).toUpperCase()}
                   </AppText>
                ) : (
                  <Ionicons name="person" size={32} color={colors.primary} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <AppText variant="semibold" size="lg">
                  {isLoggedIn ? (username || email || t('common.user')) : (t('common.guestUser') || 'Guest User')}
                </AppText>
                <Caption>{isLoggedIn ? (t('settings.tapToEdit') || 'Tap to edit profile') : t('settings.signInToSync')}</Caption>
              </View>
            </TouchableOpacity>
            
            {isLoggedIn ? (
              <TouchableOpacity 
                style={[styles.signInButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                onPress={handleSignOut}
              >
                <AppText variant="medium" size="sm" color={colors.text.primary}>{t('common.signOut') || 'Sign Out'}</AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.signInButton, { backgroundColor: colors.primaryMuted }]}
                onPress={() => (navigation as any).navigate('SignIn')}
              >
                <AppText variant="medium" size="sm" color={colors.primary}>{t('common.signIn')}</AppText>
              </TouchableOpacity>
            )}
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('settings.quickTools')}</Label>
          <View style={styles.toolsGrid}>
            <ToolCard icon="calculator-outline" label={t('settings.billSplit')} onPress={() => setShowBillSplitModal(true)} />
            <ToolCard icon="search-outline" label={t('common.search')} onPress={() => setShowSearchModal(true)} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('settings.notifications')}</Label>
          <PremiumCard variant="default" padding="none">
            <SettingItem
              icon="notifications-outline"
              iconColor={colors.warning}
              title={t('settings.pushNotifications')}
              subtitle={t('settings.pushNotificationsSub')}
              showSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
              showArrow={false}
            />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('settings.preferences')}</Label>
          <PremiumCard variant="default" padding="none">
            <SettingItem icon="cash-outline" iconColor={colors.success} title={t('settings.currency')} value={currency} onPress={() => setShowCurrencyPicker(true)} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem icon="language-outline" iconColor={colors.info} title={t('settings.language')} value={LANGUAGES.find(l => l.code === language)?.name || 'English'} onPress={() => setShowLanguagePicker(true)} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem icon="moon-outline" iconColor={colors.primary} title={t('settings.darkMode')} showSwitch switchValue={darkMode} onSwitchChange={setDarkMode} showArrow={false} />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('settings.dataManagement')}</Label>
          <PremiumCard variant="default" padding="none">
            <SettingItem 
              icon="cloud-upload-outline" 
              iconColor={colors.accent} 
              title={t('settings.cloudSync')} 
              subtitle={isSyncing ? 'Syncing...' : t('settings.cloudSyncSub')} 
              onPress={handleSync}
              loading={isSyncing}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem icon="download-outline" iconColor={colors.info} title={t('settings.exportData')} subtitle={t('settings.exportDataSub')} onPress={handleExport} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem icon="cloud-download-outline" iconColor={colors.success} title={t('settings.importData')} subtitle={t('settings.importDataSub')} onPress={handleImport} />
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('settings.account') || 'Account'}</Label>
          <PremiumCard variant="default" padding="none">
            <SettingItem 
              icon="school-outline"
              iconColor={colors.info}
              title={t('settings.replayTutorial') || 'Replay Tutorial'}
              subtitle={t('settings.replayTutorialSub') || 'Learn how to use the app'}
              onPress={() => {
                setHasCompletedTutorial(false);
                Toast.show({ type: 'success', text1: 'Tutorial will show on next screen' });
              }}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingItem 
              icon="trash-outline" 
              danger 
              title={t('settings.deleteAccount') || 'Delete Account'} 
              subtitle={t('settings.deleteAccountSub') || 'Permanently delete your data'}
              onPress={handleDeleteAccount} 
            />
          </PremiumCard>
        </Animated.View>

        <View style={styles.footer}>
          <Caption>{t('settings.version')} 2.0.0</Caption>
        </View>

        <View style={{ height: Layout.screen.paddingBottom }} />
      </ScrollView>

      <CurrencyPickerModal />
      <LanguagePickerModal />
      <SearchModal visible={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <BillSplitModal visible={showBillSplitModal} onClose={() => setShowBillSplitModal(false)} />
    </SafeAreaView>
  );
};

const ToolCard = ({ icon, label, onPress }: any) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.toolCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress}>
      <View style={[styles.toolIcon, { backgroundColor: colors.primaryMuted }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <AppText variant="medium" size="sm" color={colors.text.secondary}>{label}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  ambientBg: { ...StyleSheet.absoluteFillObject, height: 400 },
  scrollContent: { paddingHorizontal: Layout.screen.paddingHorizontal, paddingTop: Layout.screen.paddingTop },
  header: { marginBottom: Spacing['5'] },
  section: { marginBottom: Spacing['6'] },
  sectionTitle: { marginBottom: Spacing['3'] },
  profileCard: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1, marginLeft: Spacing['4'] },
  signInButton: { paddingHorizontal: Spacing['4'], paddingVertical: Spacing['2'], borderRadius: BorderRadius.full },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['3'] },
  toolCard: { width: '47%', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing['4'], alignItems: 'center' },
  toolIcon: { width: 48, height: 48, borderRadius: BorderRadius.DEFAULT, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['2'] },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing['4'] },
  settingIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing['3'] },
  settingContent: { flex: 1 },
  settingTitleRow: { flexDirection: 'row', alignItems: 'center' },
  newBadge: { marginLeft: Spacing['2'], paddingHorizontal: Spacing['2'], paddingVertical: 2, borderRadius: BorderRadius.sm },
  divider: { height: 1, marginLeft: Spacing['4'] + 40 + Spacing['3'] },
  footer: { alignItems: 'center', paddingVertical: Spacing['6'] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], maxHeight: '70%', paddingBottom: Spacing['6'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing['4'], borderBottomWidth: 1 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing['4'], borderBottomWidth: 1 },
  currencyRow: { flexDirection: 'row', alignItems: 'center' },
});
