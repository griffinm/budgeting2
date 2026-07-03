export interface ErrorResponse {
  messages?: string[];
  errors?: string[];
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
  linkedAccounts: number;
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

export interface SignupResponse {
  user: User;
  token: string;
}

export type PlaidAccountType = 'checking' | 'savings' | 'credit' | 'loan' | 'other';
export type AccountType = 'deposit' | 'credit' | 'loan' | 'investment';

export interface PlaidAccount {
  id: number;
  accountType: AccountType;
  plaidMask: string;
  plaidOfficialName: string;
  plaidType: PlaidAccountType;
  plaidSubtype: string;
  nickname: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export type ClassificationSource =
  | 'merchant_default'
  | 'category_default'
  | 'plaid_category'
  | 'sign_inference'
  | 'user';

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
  defaultMerchantTag: MerchantCategory | null;
  defaultTags: Tag[];
  merchantGroup?: MerchantGroup | null;
  transactionCount?: number;
}

export interface MerchantGroup {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  primaryMerchant: Merchant;
  merchants: Merchant[];
  merchantCount?: number;
}

export interface MerchantGroupSuggestion {
  merchant: {
    id: number;
    name: string;
    customName: string | null;
  };
  reason: string;
  confidence: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  accountId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagSpendStats {
  month: number;
  year: number;
  tagId: number;
  totalAmount: number;
}

export interface TagReport {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  accountId: number;
  includedTagIds: number[];
  omittedTagIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTag {
  id: number;
  tagId: number;
  tag: Tag;
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
  classificationSource?: ClassificationSource | null;
  checkNumber: string | null;
  merchant: Merchant;
  plaidAccount: PlaidAccount;
  merchantTag?: MerchantCategory | null;
  hasDefaultMerchantTag?: boolean;
  note?: string | null;
  recurring: boolean;
  categoryPrimary: string | null;
  categoryDetail: string | null;
  categoryConfidenceLevel: string | null;
  isCheck: boolean;
  transactionTags: TransactionTag[];
  split: boolean;
  parentTransactionId: number | null;
  childTransactions?: Transaction[]; // present on show for a split parent
  parentTransaction?: Transaction; // present on show for a split child
}

export interface MerchantCategory {
  id: number;
  name: string;
  parentMerchantTagId: number | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  totalTransactionAmount?: number;
  children: MerchantCategory[];
  targetBudget?: number | null;
  isLeaf: boolean;
  tagType: 'expense' | 'income';
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
  monthsBack: number;
  monthlySpend: MerchantSpendMonth[];
  allTimeSpend: number;
  monthlyIncome?: MerchantSpendMonth[];
  allTimeIncome?: number;
}

export interface ProfitAndLossItem {
  date: string;
  year: number;
  month: number;
  expense: number;
  income: number;
  profit: number;
  profitPercentage: number;
}

export type PlaidConnectionStatus = 'active' | 'login_required' | 'error';

export interface PlaidAccount {
  id: number;
  plaidOfficialName: string;
  plaidType: PlaidAccountType;
  plaidSubtype: string;
  plaidMask: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
  plaidAccessTokenId: number;
  connectionStatus: PlaidConnectionStatus | null;
  needsReconnect: boolean;
  errorCode: string | null;
}

export interface SyncEvent {
  id: number;
  startedAt: string;
  completedAt: string | null;
}

export interface AccountBalance {
  id: number;
  plaidAccountId: number;
  currentBalance: number;
  availableBalance: number;
  limit: number;
  plaidAccount: PlaidAccount;
  createdAt: string;
}

export interface AccountBalanceHistory {
  id: number;
  currentBalance: number;
  createdAt: string;
}

export type TimeRange = '1m' | '3m' | '6m' | '12m' | 'all';

export interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UpdateAllResponse {
  message: 'update_already_queued' | 'update_not_needed' | 'update_queued';
  last_sync_time: string;
  is_updating: boolean;
}

export interface MerchantCategorySpendStats {
  month: number;
  year: number;
  tagId: number;
  totalAmount: number;
  merchantTag?: MerchantCategory;
}

export interface PageRequestParams {
  page: number;
  perPage: number;
}

export interface MovingAverage {
  dayOfMonth: number;
  dayAverage: number;
  cumulativeTotal: number;
  cumulativeAveragePerDay: number;
}

