export type BillingCycle = "weekly" | "monthly" | "yearly" | "custom";

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  baseCurrencyAmount?: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays?: number;
  startDate: string;
  nextRenewalDate: string;
  trialEndDate?: string;
  paymentMethod: string;
  gracePeriodDays?: number;
  notes?: string;
  tags?: string[];
  attachments?: string[];
  isActive: boolean;
  isArchived: boolean; // For "Archivo" feature
  sharedWith: number; // For "Split-Billing" (1 = just user, 2 = split with 1 other, etc.)
  usageCount?: number;
  lastUsedDate?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget?: number;
}

export interface Budget {
  overallMonthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface SpendingStats {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  lifetimeSpend: number; // New metric
  upcomingCharges: {
    days7: number;
    days30: number;
    days90: number;
  };
  categoryBreakdown: Record<string, number>;
  burnRate: number; // Daily spend
}
