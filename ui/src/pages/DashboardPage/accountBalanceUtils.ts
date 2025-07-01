import { AccountBalance, PlaidAccountType } from "@/utils/types";

const cashAccountTypes: PlaidAccountType[] = ['checking', 'savings'];

export function getCurrentBalance(accountBalance: AccountBalance) {
  if (cashAccountTypes.includes(accountBalance.plaidAccount.plaidType)) {
    return accountBalance.availableBalance;
  }

  return accountBalance.currentBalance;
}