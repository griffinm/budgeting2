import { baseClient } from "./base-client";
import { PlaidAccount, UpdateAllResponse } from "@/utils/types";

export const fetchPlaidAccounts = async (): Promise<PlaidAccount[]> => {
  const response = await baseClient.get("/plaid_accounts");
  return response.data;
};

export const addUserToPlaidAccount = async ({
  plaidAccountId,
  userId,
}: {
  plaidAccountId: string;
  userId: string;
}) => {
  const response = await baseClient.post(`/users/${userId}/plaid_accounts/${plaidAccountId}`);
  return response.data;
};


export const removeUserFromPlaidAccount = async ({
  plaidAccountId,
  userId,
}: {
  plaidAccountId: string;
  userId: string;
}) => {
  const response = await baseClient.delete(`/users/${userId}/plaid_accounts/${plaidAccountId}`);
  return response.data;
};
