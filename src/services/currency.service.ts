
// Extended offline currency conversion service with preferences integration
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.3,
  JPY: 151.4,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.24,
  SGD: 1.34,
};

// Locale mapping for number formatting
const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
  CHF: 'de-CH',
  CNY: 'zh-CN',
  SGD: 'en-SG',
};

export class CurrencyService {
  private static baseCurrency: string = 'USD';
  
  static setBaseCurrency(currency: string) {
    if (EXCHANGE_RATES[currency]) {
      this.baseCurrency = currency;
    }
  }

  static getBaseCurrency(): string {
    return this.baseCurrency;
  }

  static convertToBase(amount: number, fromCurrency: string, baseCurrency?: string): number {
    const targetCurrency = baseCurrency || this.baseCurrency;
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const baseRate = EXCHANGE_RATES[targetCurrency] || 1;
    
    // Convert to USD first, then to base
    const inUSD = amount / fromRate;
    return inUSD * baseRate;
  }

  static convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;
    
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  }

  static format(amount: number, currency?: string): string {
    const curr = currency || this.baseCurrency;
    const locale = LOCALE_MAP[curr] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'JPY' ? 0 : 2,
      maximumFractionDigits: curr === 'JPY' ? 0 : 2,
    }).format(amount);
  }

  static formatCompact(amount: number, currency?: string): string {
    const curr = currency || this.baseCurrency;
    const locale = LOCALE_MAP[curr] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  static getSymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      CAD: 'CA$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      SGD: 'S$',
    };
    return symbols[currency] || '$';
  }

  static getRate(currency: string): number {
    return EXCHANGE_RATES[currency] || 1;
  }
}
