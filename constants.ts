
import { Currency, RoundingRule } from './types';

export const CURRENCIES: { value: Currency; label: string }[] = [
    { value: Currency.VND, label: 'VND' },
    { value: Currency.USD, label: 'USD' },
    { value: Currency.EUR, label: 'EUR' },
    { value: Currency.JPY, label: 'JPY' },
];

export const ROUNDING_RULES: { value: RoundingRule; labelKey: string }[] = [
    { value: RoundingRule.ONE, labelKey: 'rounding_one' },
    { value: RoundingRule.HUNDRED, labelKey: 'rounding_hundred' },
    { value: RoundingRule.THOUSAND, labelKey: 'rounding_thousand' },
];

export const DEFAULT_CATEGORIES: string[] = [
    'food',
    'transport',
    'accommodation',
    'shopping',
    'entertainment',
    'tickets',
    'other',
];
