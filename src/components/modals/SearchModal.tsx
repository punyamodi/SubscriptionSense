// SearchModal.tsx - Quick search for subscriptions
import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Caption } from '../../components/common/AppText';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';
import { Subscription } from '../../types/subscription';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { subscriptions } = useSubscriptionStore();
  const [query, setQuery] = useState('');

  const subsList = subscriptions || [];

  const filteredSubscriptions = useMemo(() => {
    if (!query.trim()) return subsList.slice(0, 10);
    
    const lowerQuery = query.toLowerCase();
    return subsList.filter(sub => 
      sub.name.toLowerCase().includes(lowerQuery) ||
      sub.category.toLowerCase().includes(lowerQuery)
    );
  }, [subsList, query]);

  const handleSelect = (subscription: Subscription) => {
    Keyboard.dismiss();
    onClose();
    setQuery('');
    (navigation as any).navigate('SubscriptionDetails', { subscriptionId: subscription.id });
  };

  const getCategoryColor = (category: string) => {
    return Colors.categories[category.toLowerCase() as keyof typeof Colors.categories] || Colors.primary;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={Colors.text.tertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search subscriptions..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <AppText variant="medium" size="base" color={Colors.primary}>Cancel</AppText>
              </TouchableOpacity>
            </View>

            {/* Results */}
            <FlatList
              data={filteredSubscriptions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={Colors.text.tertiary} />
                  <AppText variant="medium" size="base" color={Colors.text.secondary} style={{ marginTop: Spacing['3'] }}>
                    {query ? 'No subscriptions found' : 'Start typing to search'}
                  </AppText>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
                  <View style={styles.resultInfo}>
                    <AppText variant="medium" size="base">{item.name}</AppText>
                    <Caption>{item.category} • {item.billingCycle}</Caption>
                  </View>
                  <View style={styles.resultAmount}>
                    <AppText variant="semibold" size="base" color={Colors.primary}>
                      {CurrencyService.format(item.amount, item.currency)}
                    </AppText>
                    {item.isActive ? (
                      <View style={styles.activeBadge}>
                        <AppText variant="medium" size="2xs" color={Colors.success}>Active</AppText>
                      </View>
                    ) : (
                      <View style={[styles.activeBadge, { backgroundColor: Colors.errorMuted }]}>
                        <AppText variant="medium" size="2xs" color={Colors.error}>Paused</AppText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['4'],
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    gap: Spacing['3'],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing['3'],
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing['2'],
    fontSize: 16,
    color: Colors.text.primary,
  },
  cancelButton: {
    paddingHorizontal: Spacing['2'],
  },
  resultsList: {
    paddingBottom: Spacing['4'],
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing['4'],
    marginBottom: Spacing['2'],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing['3'],
  },
  resultInfo: {
    flex: 1,
  },
  resultAmount: {
    alignItems: 'flex-end',
  },
  activeBadge: {
    marginTop: Spacing['1'],
    paddingHorizontal: Spacing['2'],
    paddingVertical: 2,
    backgroundColor: Colors.successMuted,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['12'],
  },
});
