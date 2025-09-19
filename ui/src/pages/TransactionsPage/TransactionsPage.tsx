import { useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantTag } from '@/utils/types';
import { fetchMerchantTags } from '@/api/merchant-tags-client';
import { useSyncEvent } from '@/hooks/useSyncEvent';
import { format as formatDate } from 'date-fns';
import { Card } from '@mantine/core';

export default function TransactionsPage() {
  const { 
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    page,
    searchParams,
    setSearchParams,
    updateTransaction,
    clearSearchParams,
  } = useTransactions();
  const { 
    latestSyncEvent,
    isLoading: isSyncEventLoading,
  } = useSyncEvent();
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const setTitle = usePageTitle();

  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  useEffect(() => {
    fetchMerchantTags()
      .then(setMerchantTags)
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-3">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          
          <div>
            {isSyncEventLoading ? <div>Loading...</div> : latestSyncEvent ? (
              <>Last synced at: <strong>{formatDate(latestSyncEvent.startedAt, 'MM/dd/yyyy hh:mm a')}</strong></>
            ) : (
              <em>Transactions not yet synced</em>
            )}
          </div>
        </div>
      </div>
      <Card>
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
          error={error}
          page={page}
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
          clearSearchParams={clearSearchParams}
        />

      </Card>
    </div>
  );
}
