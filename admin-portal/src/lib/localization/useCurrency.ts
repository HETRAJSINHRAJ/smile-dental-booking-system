/**
 * React hook for currency formatting with Indian Rupee support
 */

import { useState, useEffect } from 'react';
import { 
  formatIndianCurrency, 
  formatIndianNumber, 
  parseIndianCurrency,
  getCurrencySymbol,
  formatCurrency as formatCurrencyUtil
} from './currency';

export interface CurrencyHookOptions {
  locale?: string;
  currency?: string;
  useIndianFormat?: boolean;
  exchangeRate?: number;
}

export interface UseCurrencyReturn {
  formatCurrency: (amount: number, options?: Partial<CurrencyHookOptions>) => string;
  formatNumber: (amount: number) => string;
  parseCurrency: (currencyString: string) => number;
  currencySymbol: string;
  currentCurrency: string;
  currentLocale: string;
}

/**
 * React hook for currency formatting with Indian localization
 */
export function useCurrency(options: CurrencyHookOptions = {}): UseCurrencyReturn {
  const {
    locale = 'en-IN',
    currency = 'INR',
    useIndianFormat = true,
    exchangeRate = 83
  } = options;

  const [currentLocale, setCurrentLocale] = useState(locale);
  const [currentCurrency, setCurrentCurrency] = useState(currency);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(exchangeRate);

  // Update state when options change
  useEffect(() => {
    setCurrentLocale(locale);
    setCurrentCurrency(currency);
    setCurrentExchangeRate(exchangeRate);
  }, [locale, currency, exchangeRate]);

  const formatCurrency = (amount: number, formatOptions: Partial<CurrencyHookOptions> = {}): string => {
    const finalOptions = {
      locale: formatOptions.locale || currentLocale,
      currency: formatOptions.currency || currentCurrency,
      useIndianFormat: formatOptions.useIndianFormat ?? useIndianFormat
    };

    return formatCurrencyUtil(
      amount,
      finalOptions.locale,
      finalOptions.currency,
      finalOptions.useIndianFormat
    );
  };

  const formatNumber = (amount: number): string => {
    return formatIndianNumber(amount);
  };

  const parseCurrency = (currencyString: string): number => {
    return parseIndianCurrency(currencyString);
  };

  const currencySymbol = getCurrencySymbol(currentCurrency);

  return {
    formatCurrency,
    formatNumber,
    parseCurrency,
    currencySymbol,
    currentCurrency,
    currentLocale
  };
}