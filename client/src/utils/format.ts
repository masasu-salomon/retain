import dayjs from 'dayjs';
import { config } from '../config';
import type { BudgetStatus, PaymentMethod } from '../types';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: config.currency,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: config.currency,
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);
export const formatCompactCurrency = (value: number) => compactCurrencyFormatter.format(value);

/** "2026-10-07" -> "Oct 7, 2026" */
export const formatDate = (value: string) => dayjs(value).format('MMM D, YYYY');
export const formatShortDate = (value: string) => dayjs(value).format('MMM D');
export const formatDateTime = (value: string) => dayjs(value).format('MMM D, YYYY h:mm A');

/** "2026-10" -> "October 2026" */
export const formatMonth = (month: string) => dayjs(`${month}-01`).format('MMMM YYYY');

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile money',
  BANK_TRANSFER: 'Bank transfer',
  OTHER: 'Other',
};

export const BUDGET_STATUS_META: Record<
  BudgetStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching limit', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
  none: { label: 'No budget set', color: 'default' },
};
