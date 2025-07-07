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
    searchParams,
    setSearchParams,
    page,
    setPage,
    setPerPage,
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
      >
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          page={page}
          updateTransaction={updateTransaction}
          setPage={setPage}
          setPerPage={setPerPage}
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          merchantTags={merchantTags}
          showSearch={false}
        />
      </Modal>
    </div>
  )
}