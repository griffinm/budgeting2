import { useTransactions } from "@/hooks/useTransactions";
import { MerchantCategory } from "@/utils/types";
import { Modal } from "@mantine/core";
import { useEffect } from "react";
import { TransactionsTable } from "../TransactionsTable";
import { useMerchantCategories } from "@/hooks/useMerchantCategories";

export function TransactionModal({
  merchantCategory,
  onClose,
  isOpen,
}: {
  merchantCategory?: MerchantCategory;
  onClose: () => void;
  isOpen: boolean;
}) {
  const {
    transactions,
    isLoading,
    error,
    setSearchParams,
    page,
    updateTransaction,
  } = useTransactions();
  const {
    rawMerchantCategories: merchantCategories,
  } = useMerchantCategories();

  useEffect(() => {
    if (merchantCategory) {
      setSearchParams({ merchant_tag_id: merchantCategory.id });
    }
  }, [merchantCategory, setSearchParams]);

  return (
    <div>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={`Transactions for ${merchantCategory?.name}`}
        size="xl"
        padding={0}
      >
        <div className="flex flex-col h-[400px] bg-white">
          <div className="mb-4 border border-gray-200 overflow-y-auto scrollbar-hide">
            <TransactionsTable
              transactions={transactions}
              isLoading={isLoading}
              error={error}
              page={page}
              updateTransaction={updateTransaction}
              isLoadingMore={false}
              hasMore={false}
              loadMore={() => {}}
              merchantCategories={merchantCategories}
              condensed={true}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
