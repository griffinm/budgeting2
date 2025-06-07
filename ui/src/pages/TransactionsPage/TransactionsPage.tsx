import { useEffect } from 'react';
import { useTransactions, usePageTitle } from '@/hooks';
import { urls } from '@/utils/urls';
import { TransactionsTable } from '@/components/TransactionsTable';

export function TransactionsPage() {
  const { transactions, isLoading, error } = useTransactions();

  const setTitle = usePageTitle();
  
  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  return (
    <div>
      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
