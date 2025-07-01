import { AccountBalance } from "@/utils/types";
import { baseClient } from "./base-client";

export const getAccountBalances = async (): Promise<AccountBalance[]> => {
  const response = await baseClient.get<AccountBalance[]>('/plaid_accounts/account_balance');
  return response.data;
};