import { baseClient } from "./base-client";
import { PlaidAccount } from "@/utils/types";

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

export const createLinkToken = async (): Promise<{ link_token: string }> => {
  const response = await baseClient.post("/plaid_accounts/create_link_token");
  return response.data;
};

export const exchangePublicToken = async (publicToken: string): Promise<{ 
  message: string; 
  accounts: Array<{ id: number; name: string; mask: string }> 
}> => {
  const response = await baseClient.post("/plaid_accounts/exchange_public_token", {
    public_token: publicToken
  });
  return response.data;
};

export const updatePlaidAccountNickname = async ({
  plaidAccountId,
  nickname,
}: {
  plaidAccountId: number;
  nickname: string;
}): Promise<PlaidAccount> => {
  const response = await baseClient.patch(`/plaid_accounts/${plaidAccountId}`, {
    nickname,
  });
  return response.data;
};
