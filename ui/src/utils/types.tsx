export interface ErrorResponse {
  messages?: string[];
}

export interface Account {
  id: string;
  createdAt: Date,
  updatedAt: Date,
}

export interface User {
  id: string;
  createdAt: Date,
  updatedAt: Date,
  email: string;
  firstName: string;
  lastName: string;
  accountId: string;
  account: Account;
}

export interface Page {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface PageResponse<T> {
  items: T[];
  page: Page;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PlaidAccount {
  id: number;
  userId: number;
  plaidMask: string;
  plaidOfficialName: string;
  plaidType: string;
  plaidSubtype: string;
  nickname: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Merchant {
  id: number;
  name: string;
  customName: string | null;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  plaidEntityId: string | null;
  website: string | null;
  defaultTransactionType: TransactionType;
  defaultMerchantTagId?: number | null;
  defaultMerchantTag: MerchantTag | null;
}

export interface Transaction {
  id: number;
  name: string;
  accountId: number;
  authorizedAt: string | null;
  date: string;
  amount: number;
  pending: boolean;
  plaidCategoryPrimary: string | null;
  plaidCategoryDetail: string | null;
  paymentChannel: string | null;
  transactionType: TransactionType;
  checkNumber: string | null;
  currencyCode: string;
  merchant: Merchant;
  plaidAccount: PlaidAccount;
  merchantTag?: MerchantTag | null;
  hasDefaultMerchantTag?: boolean;
  note?: string | null;
}

export interface MerchantTag {
  id: number;
  name: string;
  parentMerchantTagId: number | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  totalTransactionAmount?: number;
  children: MerchantTag[];
}

export interface MantineTreeNode {
  value: string;
  label: string;
  children?: MantineTreeNode[];
}

export interface MerchantSpendMonth {
  month: string;
  amount: number;
}

export interface MerchantSpendStats {
  monthlySpend: MerchantSpendMonth[];
  allTimeSpend: number;
}

export interface ProfitAndLossItem {
  date: Date;
  expense: number;
  income: number;
  profit: number;
  profitPercentage: number;
}

export interface PlaidAccount {
  id: number;
  plaidOfficialName: string;
  plaidType: string;
  plaidSubtype: string;
  plaidMask: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncEvent {
  id: number;
  startedAt: string;
  completedAt: string | null;
}