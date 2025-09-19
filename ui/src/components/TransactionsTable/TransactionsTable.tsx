import { Transaction, Page, MerchantTag } from "@/utils/types";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TableRow } from "./TableRow";
import { Loading } from "../Loading";
import { groupTransactionsByDate } from './utils';
import { DayHeader } from "./DayHeader";
import { useEffect, useRef, useState } from 'react';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTransactions, setDisplayTransactions] = useState(transactions);
  
  // Handle fade transition when loading new search results
  useEffect(() => {
    if (isLoading) {
      // Only start fade out if we have existing transactions to fade out
      if (displayTransactions.length > 0) {
        setIsTransitioning(true);
        setTimeout(() => {
          setDisplayTransactions([]);
        }, 150); // Half of transition duration
      }
    } else {
      // Always update with new results when not loading
      setDisplayTransactions(transactions);
      setIsTransitioning(false);
    }
  }, [isLoading, transactions, displayTransactions.length]);

  // Reset transition state if we get stuck
  useEffect(() => {
    if (!isLoading && !isLoadingMore && isTransitioning) {
      setIsTransitioning(false);
    }
  }, [isLoading, isLoadingMore, isTransitioning]);
  
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(displayTransactions);

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
        {isLoading && displayTransactions.length === 0 ? (
          <div className="flex flex-row justify-center transition-opacity duration-300 ease-in-out">
            <Loading fullHeight={false} />
          </div>
        ) : (
          <div className={`flex flex-col transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
            {groupedTransactions.map((group) => (
              <div key={group.date} className="flex flex-col">
                <DayHeader
                  date={group.date}
                  transactionCount={group.transactions.length}
                />
                
                <div className="flex flex-col mx-2">
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
            {hasMore && !isLoading && displayTransactions.length > 0 && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <Loading fullHeight={false} />
                ) : (
                  <div className="text-sm text-gray-500">Loading more...</div>
                )}
              </div>
            )}
            
            {!hasMore && displayTransactions.length > 0 && !isLoading && (
              <div className="flex justify-center py-4">
                <div className="text-sm text-gray-500">No more transactions to load</div>
              </div>
            )}
            
            {/* Show loading state during search */}
            {isLoading && displayTransactions.length > 0 && (
              <div className="flex justify-center py-4">
                <Loading fullHeight={false} />
              </div>
            )}
            
            {/* Show empty state when no transactions and not loading */}
            {displayTransactions.length === 0 && !isLoading && (
              <div className="flex justify-center py-8">
                <div className="text-sm text-gray-500">No transactions found</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
