import { AccountBalance, AccountBalanceHistory, AccountType, TimeRange } from "@/utils/types";
import { baseClient } from "./base-client";

export const getAccountBalances = async (): Promise<AccountBalance[]> => {
  const response = await baseClient.get<AccountBalance[]>('/plaid_accounts/account_balance');
  return response.data;
};

export const getAccountBalanceHistory = async (
  plaidAccountId: number,
  timeRange: TimeRange = '6m'
): Promise<AccountBalanceHistory[]> => {
  const response = await baseClient.get<AccountBalanceHistory[]>(
    '/plaid_accounts/account_balance_history',
    {
      params: {
        plaid_account_id: plaidAccountId,
        time_range: timeRange,
      }
    }
  );
  return response.data;
};

export const getAccountTypeBalanceHistory = async (
  accountType: AccountType,
  timeRange: TimeRange = '6m'
): Promise<AccountBalanceHistory[]> => {
  const response = await baseClient.get<AccountBalanceHistory[]>(
    '/plaid_accounts/account_balance_history_by_type',
    {
      params: {
        account_type: accountType,
        time_range: timeRange,
      }
    }
  );
  return response.data;
};