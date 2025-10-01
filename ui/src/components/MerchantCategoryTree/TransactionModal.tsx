import { useTransactions } from "@/hooks/useTransactions";
import { MerchantTag } from "@/utils/types";
import { Modal } from "@mantine/core";
import { useEffect } from "react";
import { TransactionsTable } from "../TransactionsTable";
import { useMerchantTags } from "@/hooks/useMerchantTags";

export function TransactionModal({
  merchantTag,
  onClose,
  isOpen,
}: {
  merchantTag?: MerchantTag;
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
    rawMerchantTags: merchantTags,
  } = useMerchantTags();

  useEffect(() => {
    if (merchantTag) {
      setSearchParams({ merchant_tag_id: merchantTag.id });
    }
  }, [merchantTag, setSearchParams]);

  return (
    <div>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={`Transactions for ${merchantTag?.name}`}
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
              merchantTags={merchantTags}
              condensed={true}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
