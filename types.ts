
export enum Currency {
    VND = 'VND',
    USD = 'USD',
    EUR = 'EUR',
    JPY = 'JPY',
}

export enum RoundingRule {
    ONE = 1,
    HUNDRED = 100,
    THOUSAND = 1000,
}

export interface Member {
    id: string;
    name: string;
    coefficient: number;
}

export interface Activity {
    id: string;
    date: string;
    time: string;
    activity: string;
    location: string;
    notes: string;
}

export type Category = string;

export interface Expense {
    id:string;
    content: string;
    amount: number;
    currency: Currency;
    exchangeRate?: number;
    paidBy: string; // memberId
    category: Category;
    shared: boolean;
    receiptImage?: string; // base64 string
    date: string;
    activityId?: string;
}

export interface Trip {
    id: string;
    name: string;
    from: string;
    to: string;
    startDate: string;
    endDate: string;
    adults: number;
    children: number;
    currency: Currency;
    childCoefficient: number;
    roundingRule: RoundingRule;
    members: Member[];
    itinerary: Activity[];
    expenses: Expense[];
    categories: Category[];
}

export interface OCRResult {
    amount?: number;
    content?: string;
}
