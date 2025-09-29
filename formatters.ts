
import { Currency } from './types';

export const formatCurrency = (amount: number, currency: Currency, maximumFractionDigits = 2) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : maximumFractionDigits,
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};
