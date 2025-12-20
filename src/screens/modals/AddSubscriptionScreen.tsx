import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { Linking, Alert } from 'react-native';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { GlassCard } from '../../components/common/GlassCard';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { BillingCycle } from '../../types/subscription';
import { EXCHANGE_RATES } from '../../services/currency.service';
import { getCancellationUrl } from '../../utils/cancellation';

const POPULAR_SERVICES = [
  { name: 'Netflix', amount: '15.49', category: 'Streaming', icon: 'play-circle' },
  { name: 'Spotify', amount: '10.99', category: 'Streaming', icon: 'musical-notes' },
  { name: 'YouTube Premium', amount: '13.99', category: 'Streaming', icon: 'logo-youtube' },
  { name: 'Amazon Prime', amount: '14.99', category: 'Lifestyle', icon: 'cart' },
  { name: 'Disney+', amount: '13.99', category: 'Streaming', icon: 'videocam' },
  { name: 'iCloud+', amount: '2.99', category: 'Utilities', icon: 'cloud' },
  { name: 'ChatGPT Plus', amount: '20.00', category: 'Software', icon: 'chatbox-ellipses' },
];

const CATEGORIES = [
  { name: 'Streaming', icon: 'play-circle-outline' },
  { name: 'Software', icon: 'code-outline' },
  { name: 'Utilities', icon: 'flash-outline' },
  { name: 'Health', icon: 'fitness-outline' },
  { name: 'Education', icon: 'school-outline' },
  { name: 'Finance', icon: 'wallet-outline' },
  { name: 'Lifestyle', icon: 'heart-outline' },
];

const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

type FormData = {
  name: string;
  amount: string;
  currency: string;
  category: string;
  billingCycle: BillingCycle;
  sharedWith: string;
  trialEndDate: string;
};

interface RouteParams {
  subscriptionId?: string;
}

export const AddSubscriptionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { subscriptions, addSubscription, updateSubscription } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  
  // Check if we're editing
  const subscriptionId = route.params?.subscriptionId;
  const existingSubscription = subscriptionId 
    ? (subscriptions || []).find(s => s.id === subscriptionId) 
    : null;
  const isEditMode = !!existingSubscription;

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: existingSubscription?.name || '',
      amount: existingSubscription?.amount?.toString() || '',
      currency: existingSubscription?.currency || 'USD',
      category: existingSubscription?.category || 'Streaming',
      billingCycle: existingSubscription?.billingCycle || 'monthly',
      sharedWith: existingSubscription?.sharedWith?.toString() || '1',
      trialEndDate: existingSubscription?.trialEndDate || '',
    },
  });

  const selectedCategory = watch('category');
  const selectedCycle = watch('billingCycle');
  const isTrial = !!watch('trialEndDate');

  const onSubmit = (data: FormData) => {
    setLoading(true);
    try {
      if (isEditMode && existingSubscription) {
        // Update existing subscription
        updateSubscription(existingSubscription.id, {
          name: data.name,
          amount: parseFloat(data.amount) || 0,
          currency: data.currency,
          category: data.category,
          billingCycle: data.billingCycle,
          sharedWith: parseInt(data.sharedWith) || 1,
          trialEndDate: data.trialEndDate || undefined,
        });
        Toast.show({ type: 'success', text1: 'Subscription updated!' });
      } else {
        // Add new subscription
        addSubscription({
          ...data,
          amount: parseFloat(data.amount) || 0,
          sharedWith: parseInt(data.sharedWith) || 1,
          startDate: new Date().toISOString(),
          paymentMethod: 'card',
        });
        Toast.show({ type: 'success', text1: 'Subscription added!' });
      }
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to save subscription' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (!existingSubscription) return;
    const url = getCancellationUrl(existingSubscription.name);
    
    Alert.alert(
      'Cancel Subscription?',
      `Do you want to go to the cancellation page for ${existingSubscription.name}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Take me there', 
          onPress: async () => {
            const target = url || `https://www.google.com/search?q=how+to+cancel+${existingSubscription.name}+subscription`;
            const canOpen = await Linking.canOpenURL(target);
            if (canOpen) {
              Linking.openURL(target);
            } else {
              Toast.show({ type: 'error', text1: 'Could not open link' });
            }
          }
        }
      ]
    );
  };

  const prefillService = (service: typeof POPULAR_SERVICES[0]) => {
    setValue('name', service.name);
    setValue('amount', service.amount);
    setValue('category', service.category);
    Toast.show({ type: 'info', text1: `Selected ${service.name}`, visibilityTime: 1000 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <AppText variant="semibold" size="lg">{isEditMode ? 'Edit Subscription' : 'New Subscription'}</AppText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.form}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Popular Services (Only in Add Mode) */}
          {!isEditMode && (
            <View style={{ marginBottom: 24 }}>
              <AppText variant="semibold" size="sm" color={Colors.text.primary} style={{ marginBottom: 12 }}>
                Popular Services
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                {POPULAR_SERVICES.map((service) => (
                  <TouchableOpacity
                    key={service.name}
                    style={styles.serviceChip}
                    onPress={() => prefillService(service)}
                  >
                    <Ionicons name={service.icon as any} size={20} color={Colors.primary} />
                    <AppText variant="medium" size="sm" style={{ marginLeft: 8 }}>{service.name}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
              Service Name
            </AppText>
            <Controller
              control={control}
              name="name"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor={Colors.text.tertiary}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Amount & Currency */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
                Amount
              </AppText>
              <Controller
                control={control}
                name="amount"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text.tertiary}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
                Currency
              </AppText>
              <Controller
                control={control}
                name="currency"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                )}
              />
            </View>
          </View>

          {/* Billing Cycle */}
          <View style={styles.inputGroup}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
              Billing Cycle
            </AppText>
            <View style={styles.cycleRow}>
              {BILLING_CYCLES.map((cycle) => (
                <TouchableOpacity
                  key={cycle.value}
                  style={[
                    styles.cycleButton,
                    selectedCycle === cycle.value && styles.cycleButtonActive,
                  ]}
                  onPress={() => setValue('billingCycle', cycle.value)}
                >
                  <AppText 
                    variant="medium" 
                    size="sm"
                    color={selectedCycle === cycle.value ? Colors.text.inverse : Colors.text.secondary}
                  >
                    {cycle.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
              Category
            </AppText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const categoryColor = Colors.categories[cat.name.toLowerCase() as keyof typeof Colors.categories] || Colors.accent;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryChip,
                      isSelected && { backgroundColor: categoryColor, borderColor: categoryColor },
                    ]}
                    onPress={() => setValue('category', cat.name)}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={18} 
                      color={isSelected ? Colors.text.inverse : Colors.text.secondary} 
                    />
                    <AppText 
                      variant="medium" 
                      size="sm"
                      color={isSelected ? Colors.text.inverse : Colors.text.primary}
                      style={{ marginLeft: 6 }}
                    >
                      {cat.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Split With */}
          <View style={styles.inputGroup}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
              Split With (People)
            </AppText>
            <Controller
              control={control}
              name="sharedWith"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="1 (Just you)"
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.text.tertiary}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <AppText variant="regular" size="xs" color={Colors.text.tertiary} style={{ marginTop: 6 }}>
              Enter the total number of people sharing this subscription
            </AppText>
          </View>

          {/* Trial End Date */}
          <View style={styles.inputGroup}>
            <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
              Trial End Date (Optional)
            </AppText>
            <Controller
              control={control}
              name="trialEndDate"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.text.tertiary}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Trial Alert */}
          {isTrial && (
            <GlassCard variant="accent" style={styles.trialAlert}>
              <View style={styles.trialContent}>
                <Ionicons name="timer-outline" size={24} color={Colors.accent} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <AppText variant="semibold" size="base">Trial Tracking Active</AppText>
                  <AppText variant="regular" size="sm" color={Colors.text.secondary}>
                    We'll remind you 3 days before this trial ends
                  </AppText>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <AppButton
              title={isEditMode ? "Save Changes" : "Add Subscription"}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
            />
            
            {isEditMode && (
              <TouchableOpacity style={styles.cancelLinkButton} onPress={handleCancelClick}>
                <AppText variant="medium" size="sm" color={Colors.error}>
                  How to Cancel {existingSubscription?.name}?
                </AppText>
                <Ionicons name="open-outline" size={16} color={Colors.error} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    color: Colors.text.primary,
    fontFamily: Fonts.SansMedium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  row: {
    flexDirection: 'row',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cycleButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trialAlert: {
    marginBottom: 24,
  },
  trialContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitContainer: {
    marginTop: 8,
  },
  cancelLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
