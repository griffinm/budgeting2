import { useEffect, useState } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';
import { MerchantCategory } from '@/utils/types';
import { fetchMerchantCategories } from '@/api/merchant-categories-client';
import { usePlaidAccount } from '@/hooks/usePlaidAccount';
import { useTags } from '@/hooks/useTags';
import { Card } from '@mantine/core';
import { Search } from '@/components/TransactionsTable/Search';
import { SearchFilters } from '@/components/TransactionsTable/SearchFilters';
import { FooterActionBar } from '@/components/TransactionsTable/FooterActionBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
    scrollCacheKey,
  } = useTransactions();

  const { plaidAccounts } = usePlaidAccount();
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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
    fetchMerchantCategories()
      .then(setMerchantCategories)
      .catch(console.error);
  }, []);

  return (
    <div className="h-full flex flex-col">
      
      <div className="hidden md:block flex-shrink-0 mb-3">
        <Search
          searchParams={searchParams}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-row gap-3">
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
            merchantCategories={merchantCategories}
            allTags={allTags}
            addTransactionTag={addTransactionTag}
            removeTransactionTag={removeTransactionTag}
            createAndAddTag={createAndAddTag}
            scrollCacheKey={scrollCacheKey}
          />
        </Card>

        {showFilters && (
          <Card p="md" className="hidden md:flex flex-col w-80 flex-shrink-0 min-h-0 overflow-y-auto">
            <ErrorBoundary>
              <SearchFilters
                searchParams={searchParams}
                onSetSearchParams={setSearchParams}
                clearSearchParams={clearSearchParams}
                plaidAccounts={plaidAccounts}
                tags={allTags}
                totalCount={page.totalCount}
                isLoading={isLoading}
              />
            </ErrorBoundary>
          </Card>
        )}
      </div>

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
