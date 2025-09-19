import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTransactions,
  TransactionSearchParams,
  TransactionUpdateParams,
  updateTransaction as updateTransactionApi,
} from '@/api/transaction-client';
import { Page, Transaction } from '@/utils/types';

const SEARCH_PARAMS_KEY = "transactionSearch";

function localStorageBaseKey() {
  const url = window.location.pathname;
  const urlKey = url.split('/').join('-');
  return `${urlKey}-${SEARCH_PARAMS_KEY}`;
}

function saveSearchToLocalStorage(search: TransactionSearchParams) {
  // Remove page from search params before saving since we don't need to restore page with infinite scroll
  const { ...searchWithoutPage } = search;
  localStorage.setItem(localStorageBaseKey(), JSON.stringify(searchWithoutPage));
}

function getSearchFromLocalStorage(): TransactionSearchParams | null {
  const search = localStorage.getItem(localStorageBaseKey());
  return search ? JSON.parse(search) : null;
}

function clearSearchFromLocalStorage() {
  localStorage.removeItem(localStorageBaseKey());
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  searchParams: TransactionSearchParams;
  setSearchParams: (searchParams: TransactionSearchParams) => void;
  page: Page;
  hasMore: boolean;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

export const useTransactions = ({
  initialSearchParams = {},
}: {
  initialSearchParams?: TransactionSearchParams;
} = {}) => {
  const [state, setState] = useState<TransactionsState>({
    searchParams: getSearchFromLocalStorage() || initialSearchParams || {},
    setSearchParams: () => {},
    transactions: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    updateTransaction: () => {},
    hasMore: true,
    page: {
      currentPage: 1, // Always start from page 1 with infinite scroll
      totalPages: 1,
      totalCount: 0,
    },
  });

  // Use refs to track current values to avoid stale closures
  const currentPageRef = useRef(1);
  const searchParamsRef = useRef(state.searchParams);
  
  // Update refs when state changes
  useEffect(() => {
    currentPageRef.current = state.page.currentPage;
    searchParamsRef.current = state.searchParams;
  }, [state.page.currentPage, state.searchParams]);

  const fetchTransactions = useCallback(async (isLoadingMore = false) => {
    // Calculate the page to fetch using current ref values
    const currentPage = isLoadingMore ? currentPageRef.current + 1 : currentPageRef.current;
    const searchParams = searchParamsRef.current;

    // Update loading state and page immediately to prevent duplicate requests
    setState(prev => {
      if (isLoadingMore) {
        return { 
          ...prev, 
          isLoadingMore: true, 
          error: null,
          page: { ...prev.page, currentPage }
        };
      } else {
        return { ...prev, isLoading: true, error: null };
      }
    });

    const apiParams = {
      ...searchParams,
      page: currentPage,
    };

    if (!isLoadingMore) {
      saveSearchToLocalStorage(apiParams);
    }

    try {
      const response = await getTransactions({
        params: apiParams,
      });
      
      const newTransactions = response.items || [];
      const hasMore = currentPage < (response.page?.totalPages ?? 1);
      
      setState(prev => {
        let updatedTransactions: Transaction[];
        
        if (isLoadingMore) {
          // Merge new transactions with existing ones, removing duplicates
          const existingIds = new Set(prev.transactions.map(t => t.id));
          const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t.id));
          updatedTransactions = [...prev.transactions, ...uniqueNewTransactions];
        } else {
          updatedTransactions = newTransactions;
        }
        
        return {
          ...prev,
          transactions: updatedTransactions,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore,
          page: {
            currentPage: response.page?.currentPage ?? currentPage,
            totalPages: response.page?.totalPages ?? 1,
            totalCount: response.page?.totalCount ?? 0,
          },
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: error instanceof Error ? error : new Error('Failed to fetch transactions'),
      }));
    }
  }, []);

  const setSearchParams = useCallback((newParams: TransactionSearchParams) => {
    setState(prev => ({ 
      ...prev, 
      searchParams: { ...prev.searchParams, ...newParams },
      page: { ...prev.page, currentPage: 1 }, // Reset to first page when search params change
      hasMore: true, // Reset hasMore when search params change
    }));
  }, []);

  const loadMore = useCallback(() => {
    setState(prev => {
      if (prev.hasMore && !prev.isLoadingMore) {
        fetchTransactions(true);
      }
      return prev;
    });
  }, [fetchTransactions]);

  // Removed setPage and setPerPage functions since they're not needed with infinite scroll

  const updateTransaction = useCallback((id: number, params: TransactionUpdateParams) => {
    updateTransactionApi({ id, params }).then((newTransaction) => {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(transaction => transaction.id === id ? newTransaction : transaction),
      }));
    });
  }, []);

  const clearSearchParams = () => {
    clearSearchFromLocalStorage();
    setState(prev => ({ 
      ...prev, 
      searchParams: {},
      page: { ...prev.page, currentPage: 1 }, // Reset to first page when clearing search
      hasMore: true, // Reset hasMore when clearing search
    }));
  }

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    fetchTransactions,
    loadMore,
    setSearchParams,
    updateTransaction,
    clearSearchParams,
  };
}; 
