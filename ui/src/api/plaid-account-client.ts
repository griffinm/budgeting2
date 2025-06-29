import { baseClient } from "./base-client";
import { PlaidAccount } from "@/utils/types";

export const fetchPlaidAccounts = async (): Promise<PlaidAccount[]> => {
  const response = await baseClient.get("/plaid_accounts");
  return response.data;
};
