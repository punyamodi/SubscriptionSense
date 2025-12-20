
import { addDays, addMonths, addWeeks, addYears, differenceInDays, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { Subscription, BillingCycle } from '../types/subscription';

export const calculateNextRenewal = (subscription: Subscription): string => {
  const start = parseISO(subscription.startDate);
  const now = startOfDay(new Date());
  let next = start;

  while (isBefore(next, now)) {
    switch (subscription.billingCycle) {
      case 'weekly':
        next = addWeeks(next, 1);
        break;
      case 'monthly':
        next = addMonths(next, 1);
        break;
      case 'yearly':
        next = addYears(next, 1);
        break;
      case 'custom':
        if (subscription.customIntervalDays) {
          next = addDays(next, subscription.customIntervalDays);
        } else {
          next = addMonths(next, 1); // Default to monthly if missing
        }
        break;
    }
  }

  return next.toISOString();
};

export const getDaysRemaining = (dateString: string): number => {
  const target = parseISO(dateString);
  const now = startOfDay(new Date());
  return differenceInDays(target, now);
};
