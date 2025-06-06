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

export interface LoginResponse {
  user: User;
  token: string;
}
