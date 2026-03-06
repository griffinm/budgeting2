import { useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantTag } from '@/utils/types';
import { fetchMerchantTags } from '@/api/merchant-tags-client';
import { usePlaidAccount } from '@/hooks/usePlaidAccount';
import { useTags } from '@/hooks/useTags';
import { Card } from '@mantine/core';
import { Search } from '@/components/TransactionsTable/Search';
import { FooterActionBar } from '@/components/TransactionsTable/FooterActionBar';

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
    addTransactionTag,
    removeTransactionTag,
    clearSearchParams,
  } = useTransactions();

  const { plaidAccounts } = usePlaidAccount();
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const { tags: allTags, createTag } = useTags();

  const createAndAddTag = async (transactionId: number, name: string) => {
    const newTag = await createTag(name);
    addTransactionTag(transactionId, newTag.id);
  };
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
      
      <div className="hidden md:block flex-shrink-0 mb-3">
        <Search
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          clearSearchParams={clearSearchParams}
          plaidAccounts={plaidAccounts}
          tags={allTags}
          totalCount={page.totalCount}
          isLoading={isLoading}
        />
      </div>
      
      <Card p={0} className="flex-1 min-h-0 pb-16 md:pb-0 -mx-[var(--mantine-spacing-md)] md:mx-0 rounded-none md:rounded-lg">
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
          allTags={allTags}
          addTransactionTag={addTransactionTag}
          removeTransactionTag={removeTransactionTag}
          createAndAddTag={createAndAddTag}
        />
      </Card>

      <FooterActionBar
        searchParams={searchParams}
        onSetSearchParams={setSearchParams}
        clearSearchParams={clearSearchParams}
        plaidAccounts={plaidAccounts}
        tags={allTags}
        totalCount={page.totalCount}
        isLoading={isLoading}
      />
    </div>
  );
}
