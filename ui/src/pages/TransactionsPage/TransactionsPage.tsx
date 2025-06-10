import { useEffect } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';

export function TransactionsPage() {
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
  } = useTransactions();

  const setTitle = usePageTitle();
  
  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  return (
    <div>
      <div style={{ maxWidth: '800px'}}>
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
        />
      </div>
    </div>
  );
}
