import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  getTransactions,
  TransactionSearchParams,
  TransactionUpdateParams,
  updateTransaction as updateTransactionApi,
} from '@/api/transaction-client';
import {
  createTransactionTag as createTransactionTagApi,
  deleteTransactionTag as deleteTransactionTagApi,
} from '@/api/transaction-tags-client';
import { Page, Transaction } from '@/utils/types';
import { NotificationContext } from '@/providers/Notification/NotificationContext';

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
  addTransactionTag: (transactionId: number, tagId: number) => void;
  removeTransactionTag: (transactionId: number, transactionTagId: number) => void;
}

export const useTransactions = ({
  initialSearchParams = {},
}: {
  initialSearchParams?: TransactionSearchParams;
} = {}) => {
  const { showNotification } = useContext(NotificationContext);
  const [state, setState] = useState<TransactionsState>({
    searchParams: getSearchFromLocalStorage() || initialSearchParams || {},
    setSearchParams: () => {},
    transactions: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    updateTransaction: () => {},
    addTransactionTag: () => {},
    removeTransactionTag: () => {},
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
      per_page: 25,
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
    setState(prev => {
      const updatedSearchParams = { ...prev.searchParams, ...newParams };
      
      // Update refs immediately with new values
      searchParamsRef.current = updatedSearchParams;
      currentPageRef.current = 1;
      
      // Trigger fetch after updating refs
      setTimeout(() => {
        fetchTransactions();
      }, 0);
      
      return {
        ...prev, 
        searchParams: updatedSearchParams,
        page: { ...prev.page, currentPage: 1 }, // Reset to first page when search params change
        hasMore: true, // Reset hasMore when search params change
      };
    });
  }, [fetchTransactions]);

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

  const addTransactionTag = useCallback((transactionId: number, tagId: number) => {
    createTransactionTagApi({ tagId, plaidTransactionId: transactionId })
      .then((newTransactionTag) => {
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, transactionTags: [...transaction.transactionTags, newTransactionTag] }
              : transaction
          ),
        }));
        showNotification({ title: 'Tag added', message: `"${newTransactionTag.tag.name}" added to transaction.`, type: 'success' });
      })
      .catch(() => {
        showNotification({ title: 'Error', message: 'Failed to add tag.', type: 'error' });
      });
  }, [showNotification]);

  const removeTransactionTag = useCallback((transactionId: number, transactionTagId: number) => {
    const tagName = state.transactions
      .find(t => t.id === transactionId)
      ?.transactionTags.find(tt => tt.id === transactionTagId)
      ?.tag.name;

    deleteTransactionTagApi({ id: transactionTagId })
      .then(() => {
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, transactionTags: transaction.transactionTags.filter(tt => tt.id !== transactionTagId) }
              : transaction
          ),
        }));
        showNotification({ title: 'Tag removed', message: `"${tagName}" removed from transaction.`, type: 'success' });
      })
      .catch(() => {
        showNotification({ title: 'Error', message: 'Failed to remove tag.', type: 'error' });
      });
  }, [showNotification, state.transactions]);

  const clearSearchParams = () => {
    clearSearchFromLocalStorage();
    setState(prev => {
      // Update refs immediately with cleared values
      searchParamsRef.current = {};
      currentPageRef.current = 1;
      
      // Trigger fetch after updating refs
      setTimeout(() => {
        fetchTransactions();
      }, 0);
      
      return {
        ...prev, 
        searchParams: {},
        page: { ...prev.page, currentPage: 1 }, // Reset to first page when clearing search
        hasMore: true, // Reset hasMore when clearing search
      };
    });
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
    addTransactionTag,
    removeTransactionTag,
    clearSearchParams,
  };
}; 
