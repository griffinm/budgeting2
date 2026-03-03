import { baseClient } from "@/api/base-client";
import { TransactionTag } from "@/utils/types";

export const createTransactionTag = async ({
  tagId,
  plaidTransactionId,
}: {
  tagId: number;
  plaidTransactionId: number;
}): Promise<TransactionTag> => {
  const response = await baseClient.post('/transaction_tags', {
    transaction_tag: { tag_id: tagId, plaid_transaction_id: plaidTransactionId },
  });
  return response.data;
};

export const deleteTransactionTag = async ({ id }: { id: number }): Promise<void> => {
  await baseClient.delete(`/transaction_tags/${id}`);
};
