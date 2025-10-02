export interface Trip {
  id: number;
  name: string;
  destination: string;
  departure_location?: string;
  start_date?: string;
  end_date?: string;
  currency: CurrencyEnum;
  child_factor: number;
  rounding_rule: number;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  trip_id: number;
  name: string;
  factor: number;
  is_child: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  trip_id: number;
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  trip_id: number;
  activity_id?: number;
  paid_by: number;
  description: string;
  amount: number;
  currency: CurrencyEnum;
  exchange_rate: number;
  category: ExpenseCategoryEnum;
  is_shared: boolean;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export enum CurrencyEnum {
  VND = 'VND',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
}

export enum ExpenseCategoryEnum {
  FOOD = 'food',
  TRANSPORT = 'transport',
  ACCOMMODATION = 'accommodation',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

export interface MemberBalance {
  member_id: number;
  member_name: string;
  total_paid: number;
  total_owed: number;
  balance: number;
}

export interface SettlementTransaction {
  from_member_id: number;
  from_member_name: string;
  to_member_id: number;
  to_member_name: string;
  amount: number;
}

export interface SettlementReport {
  trip_id: number;
  trip_name: string;
  currency: string;
  total_expenses: number;
  total_shared_expenses: number;
  member_balances: MemberBalance[];
  settlement_transactions: SettlementTransaction[];
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpenseByDay {
  date: string;
  amount: number;
}

export interface ExpenseByMember {
  member_name: string;
  amount: number;
}

export interface TripStatistics {
  trip_id: number;
  expenses_by_category: ExpenseByCategory[];
  expenses_by_day: ExpenseByDay[];
  expenses_by_member: ExpenseByMember[];
}

// Form types
export interface TripFormData {
  name: string;
  destination: string;
  departure_location?: string;
  start_date?: Date;
  end_date?: Date;
  currency: CurrencyEnum;
  child_factor: number;
  rounding_rule: number;
}

export interface MemberFormData {
  name: string;
  factor: number;
  is_child: boolean;
}

export interface ActivityFormData {
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time?: Date;
  end_time?: Date;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  currency: CurrencyEnum;
  exchange_rate: number;
  category: ExpenseCategoryEnum;
  paid_by: number;
  activity_id?: number;
  is_shared: boolean;
  expense_date?: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
}

// UI State types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}
