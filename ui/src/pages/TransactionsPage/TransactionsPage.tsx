import { useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantTag } from '@/utils/types';
import { fetchMerchantTags } from '@/api/merchant-tags-client';
import { useSyncEvent } from '@/hooks/useSyncEvent';
import { usePlaidAccount } from '@/hooks/usePlaidAccount';
import { format as formatDate } from 'date-fns';
import { Card } from '@mantine/core';
import { Search } from '@/components/TransactionsTable/Search';

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
  const { plaidAccounts } = usePlaidAccount();
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
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between mb-3 flex-shrink-0">
        <div className="small-text flex items-center gap-2">
          <div>
            {isSyncEventLoading ? <div>Loading...</div> : latestSyncEvent ? (
              <>Last updated at: <strong>{formatDate(latestSyncEvent.startedAt, 'MM/dd/yyyy h:mm a')}</strong></>
            ) : (
              <em>Transactions not yet synced</em>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 mb-3">
        <Search 
          searchParams={searchParams} 
          onSetSearchParams={setSearchParams} 
          clearSearchParams={clearSearchParams}
          plaidAccounts={plaidAccounts}
        />
      </div>
      
      <Card p={0} className="flex-1 min-h-0"> 
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
          error={error}
          page={page}
          updateTransaction={updateTransaction}
          merchantTags={merchantTags}
        />
      </Card>
    </div>
  );
}
