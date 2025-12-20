// BillSplitModal.tsx - Calculate bill splits for shared subscriptions
import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Caption, Label } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { AppButton } from '../../components/common/AppButton';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

interface BillSplitModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({ visible, onClose }) => {
  const { subscriptions } = useSubscriptionStore();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [splitCount, setSplitCount] = useState('2');

  const subsList = subscriptions || [];
  const sharedSubs = subsList.filter(s => (s.sharedWith || 1) > 1);

  const selectedSub = selectedSubId ? subsList.find(s => s.id === selectedSubId) : null;

  const splitAmount = useMemo(() => {
    if (!selectedSub) return 0;
    const count = parseInt(splitCount) || 1;
    return selectedSub.amount / count;
  }, [selectedSub, splitCount]);

  const totalMonthlyShared = useMemo(() => {
    return sharedSubs.reduce((total, sub) => {
      let monthly = sub.amount / (sub.sharedWith || 1);
      if (sub.billingCycle === 'yearly') monthly = monthly / 12;
      if (sub.billingCycle === 'weekly') monthly = monthly * 4.33;
      return total + monthly;
    }, 0);
  }, [sharedSubs]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <AppText variant="semibold" size="lg">Bill Split Calculator</AppText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <PremiumCard variant="default" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Caption>Shared Subscriptions</Caption>
                  <AppText variant="serifBold" size="2xl">{sharedSubs.length}</AppText>
                </View>
                <View style={styles.divider} />
                <View>
                  <Caption>Your Share (Monthly)</Caption>
                  <AppText variant="serifBold" size="2xl" color={Colors.success}>
                    {CurrencyService.format(totalMonthlyShared)}
                  </AppText>
                </View>
              </View>
            </PremiumCard>

            {/* Calculator */}
            <View style={styles.calculator}>
              <Label style={styles.sectionTitle}>Quick Calculator</Label>
              <PremiumCard variant="default">
                <View style={styles.calculatorRow}>
                  <View style={styles.calculatorInput}>
                    <Caption>Select Subscription</Caption>
                    <TouchableOpacity 
                      style={styles.dropdown}
                      onPress={() => {
                        if (subsList.length > 0 && !selectedSubId) {
                          setSelectedSubId(subsList[0].id);
                        }
                      }}
                    >
                      <AppText variant="medium" size="base" numberOfLines={1}>
                        {selectedSub?.name || 'Select...'}
                      </AppText>
                      <Ionicons name="chevron-down" size={20} color={Colors.text.tertiary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.calculatorInput, { maxWidth: 100 }]}>
                    <Caption>Split By</Caption>
                    <TextInput
                      style={styles.numberInput}
                      value={splitCount}
                      onChangeText={(t) => setSplitCount(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>
                
                {selectedSub && (
                  <View style={styles.result}>
                    <AppText variant="regular" size="sm" color={Colors.text.secondary}>
                      {CurrencyService.format(selectedSub.amount)} ÷ {parseInt(splitCount) || 1} =
                    </AppText>
                    <AppText variant="serifBold" size="3xl" color={Colors.primary}>
                      {CurrencyService.format(splitAmount)}
                    </AppText>
                    <Caption>per person</Caption>
                  </View>
                )}
              </PremiumCard>
            </View>

            {/* Shared List */}
            {sharedSubs.length > 0 && (
              <View style={styles.sharedList}>
                <Label style={styles.sectionTitle}>Currently Shared</Label>
                <FlatList
                  data={sharedSubs}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[
                        styles.sharedItem,
                        selectedSubId === item.id && styles.sharedItemSelected
                      ]}
                      onPress={() => setSelectedSubId(item.id)}
                    >
                      <View>
                        <AppText variant="medium" size="base">{item.name}</AppText>
                        <Caption>Shared with {item.sharedWith} people</Caption>
                      </View>
                      <View style={styles.sharedItemAmount}>
                        <AppText variant="semibold" size="base">
                          {CurrencyService.format(item.amount / (item.sharedWith || 1))}
                        </AppText>
                        <Caption>/person</Caption>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <AppButton
              title="Done"
              onPress={onClose}
              style={{ marginTop: Spacing['4'] }}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing['4'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  summaryCard: {
    marginBottom: Spacing['4'],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing['4'],
  },
  calculator: {
    marginBottom: Spacing['4'],
  },
  sectionTitle: {
    marginBottom: Spacing['2'],
  },
  calculatorRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  calculatorInput: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing['3'],
    borderRadius: BorderRadius.md,
    marginTop: Spacing['1'],
  },
  numberInput: {
    backgroundColor: Colors.background,
    padding: Spacing['3'],
    borderRadius: BorderRadius.md,
    marginTop: Spacing['1'],
    textAlign: 'center',
    fontSize: 18,
    color: Colors.text.primary,
  },
  result: {
    alignItems: 'center',
    marginTop: Spacing['4'],
    paddingTop: Spacing['4'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sharedList: {
    maxHeight: 200,
  },
  sharedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing['3'],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2'],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sharedItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  sharedItemAmount: {
    alignItems: 'flex-end',
  },
});
