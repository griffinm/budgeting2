import { AccountBalance, AccountType } from "@/utils/types";

export function getCurrentBalance(accountBalance: AccountBalance) {
  if (accountBalance.plaidAccount.accountType === 'deposit') {
    return parseFloat(String(accountBalance.availableBalance)) || 0;
  }

  return parseFloat(String(accountBalance.currentBalance)) || 0;
}

export function getAccountsByType(accountBalances: AccountBalance[], accountType: AccountType): AccountBalance[] {
  return accountBalances.filter((accountBalance) => accountBalance.plaidAccount.accountType === accountType);
}

export function getTotalBalanceByType(accountBalances: AccountBalance[], accountType: AccountType): number {
  return getAccountsByType(accountBalances, accountType)
    .reduce((total, accountBalance) => total + getCurrentBalance(accountBalance), 0);
}