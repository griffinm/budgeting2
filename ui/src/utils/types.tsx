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
  count: number;
  page: number;
  items: number;
  pages: number;
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

export interface Merchant {
  id: number;
  name: string;
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
  transactionType: string | null;
  checkNumber: string | null;
  currencyCode: string;
  merchant: Merchant;
  plaidAccount: PlaidAccount;
}
