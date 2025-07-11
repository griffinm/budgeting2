import { baseClient } from "./base-client";
import { User } from "@/utils/types";

export const fetchAccountUsers = async ({
  accountId,
}: {
  accountId: string;
}): Promise<User[]> => {
  const response = await baseClient.get(`/accounts/${accountId}/users`);
  return response.data;
};

