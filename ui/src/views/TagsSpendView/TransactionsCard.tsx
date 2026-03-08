import { Card } from "@mantine/core";
import { MerchantCategory, Page, Tag, Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { TransactionsTable } from "@/components/TransactionsTable";

export function TransactionsCard({
  transactions,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  error,
  page,
  updateTransaction,
  merchantCategories,
  allTags,
  addTransactionTag,
  removeTransactionTag,
  createAndAddTag,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
  page: Page;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantCategories: MerchantCategory[];
  allTags: Tag[];
  addTransactionTag: (transactionId: number, tagId: number) => void;
  removeTransactionTag: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag: (transactionId: number, name: string) => Promise<void>;
}) {
  return (
    <Card p={0} shadow="sm" radius="md" withBorder className="flex-1 min-h-0">
      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        error={error}
        page={page}
        updateTransaction={updateTransaction}
        merchantCategories={merchantCategories}
        allTags={allTags}
        addTransactionTag={addTransactionTag}
        removeTransactionTag={removeTransactionTag}
        createAndAddTag={createAndAddTag}
      />
    </Card>
  );
}
