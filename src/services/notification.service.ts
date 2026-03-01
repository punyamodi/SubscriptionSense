
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Subscription } from '../types/subscription';
import { parseISO, subDays } from 'date-fns';

export class NotificationService {
  // Check if notifications are supported in current environment
  private static isSupported(): boolean {
    if (Platform.OS === 'web') return false;
    // Expo Go doesn't support push notifications in SDK 53+
    if (Constants.executionEnvironment === 'storeClient') return false;
    return true;
  }

  static async requestPermissions() {
    if (!this.isSupported()) return false;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Notifications not available:', error);
      return false;
    }
  }

  static async scheduleSubscriptionReminder(subscription: Subscription) {
    if (!this.isSupported()) return;

    // Clear existing notifications for this subscription
    await this.cancelSubscriptionReminders(subscription.id);

    try {
      const renewalDate = parseISO(subscription.nextRenewalDate);
      
      // Remind 1 day before
      const triggerDate = subDays(renewalDate, 1);
      if (triggerDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Renewal Alert',
            body: `Your ${subscription.name} subscription will renew tomorrow for $${subscription.amount}.`,
            data: { subscriptionId: subscription.id },
          },
          // Explicit date trigger to satisfy TS in SDK 54+
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
          identifier: `${subscription.id}_1day`,
        });
      }

      // if it's a trial, remind 3 days before
      if (subscription.trialEndDate) {
        const trialEndDate = parseISO(subscription.trialEndDate);
        const trialTrigger = subDays(trialEndDate, 3);
        if (trialTrigger > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Trial Ending Soon',
              body: `The trial for ${subscription.name} ends in 3 days. Cancel to avoid charges.`,
              data: { subscriptionId: subscription.id },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trialTrigger },
            identifier: `${subscription.id}_trial`,
          });
        }
      }
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
    }
  }

  static async cancelSubscriptionReminders(subscriptionId: string) {
    if (!this.isSupported()) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(`${subscriptionId}_1day`);
      await Notifications.cancelScheduledNotificationAsync(`${subscriptionId}_trial`);
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
