import { Transaction, Page, MerchantTag } from "@/utils/types";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TableRow } from "./TableRow";
import { Loading } from "../Loading";
import { groupTransactionsByDate } from './utils';
import { DayHeader } from "./DayHeader";
import { useEffect, useRef } from 'react';

export function TransactionsTable({
  transactions,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  page,
  searchParams,
  onSetSearchParams,
  updateTransaction,
  merchantTags,
  condensed = false,
  showSearch = true,
  clearSearchParams,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
  page: Page;
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
  condensed?: boolean;
  showSearch?: boolean;
  clearSearchParams: () => void;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} transactions`}
        </div>
        {showSearch && (
          <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} clearSearchParams={clearSearchParams} />
        )}
      </div>


      <div className="flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-row justify-center my-3">
            <Loading fullHeight={false} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedTransactions.map((group) => (
              <div key={group.date} className="flex flex-col gap-2">
                <DayHeader
                  date={group.date}
                  transactionCount={group.transactions.length}
                />
                
                <div className="flex flex-col gap-3 ml-2">
                  {group.transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      transaction={transaction}
                      condensed={condensed}
                      updateTransaction={updateTransaction}
                      merchantTags={merchantTags}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <Loading fullHeight={false} />
                ) : (
                  <div className="text-sm text-gray-500">Loading more...</div>
                )}
              </div>
            )}
            
            {!hasMore && transactions.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="text-sm text-gray-500">No more transactions to load</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
