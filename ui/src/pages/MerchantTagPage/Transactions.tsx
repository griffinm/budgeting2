import { CollapsibleCard } from "@/components/CollapsibleCard";
import { Loading } from "@/components/Loading";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useMerchantTags, useTransactions } from "@/hooks";

export function Transactions({
  tagId,
}: {
  tagId: number;
}) {
  const { 
    transactions,
    isLoading,
    error,
    page,
    setPage,
    setPerPage,
    searchParams,
    setSearchParams,
    updateTransaction,
    clearSearchParams,
  } = useTransactions({ initialSearchParams: { merchant_tag_id: tagId } });
  const { merchantTags, loading } = useMerchantTags();

  return (
    <CollapsibleCard
      title="Transactions"
      initialState="collapsed"
    >
      {loading ? <Loading /> : (
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          page={page}
          setPage={setPage}
          setPerPage={setPerPage}
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
          clearSearchParams={clearSearchParams}
        />
      )}
    </CollapsibleCard>
  );
}
