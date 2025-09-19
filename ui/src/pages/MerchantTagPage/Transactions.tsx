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
    updateTransaction,
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
          isLoadingMore={false}
          hasMore={false}
          loadMore={() => {}}
          error={error}
          page={page}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
        />
      )}
    </CollapsibleCard>
  );
}
