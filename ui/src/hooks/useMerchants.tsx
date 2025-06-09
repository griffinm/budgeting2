import { useState, useEffect, useCallback } from 'react';
import { 
  fetchMerchants,
  MerchantSearchParams,
  updateMerchant as updateMerchantApi,
} from '@/api';
import { Page, Merchant } from '@/utils/types';

interface MerchantState {
  merchants: Merchant[];
  isLoading: boolean;
  error: Error | null;
  searchParams: MerchantSearchParams;
  setSearchParams: (searchParams: MerchantSearchParams) => void;
  page: Page;
  setPage: (page: number) => void;
  updateMerchant: (id: number, value: Partial<Merchant>) => Promise<void>;
}

export const useMerchants = (): MerchantState => {
  const [state, setState] = useState<MerchantState>({
    merchants: [],
    isLoading: false,
    error: null,
    searchParams: {},
    setSearchParams: () => {},
    page: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
    setPage: () => {},
    updateMerchant: async () => {},
  });

  const getMerchants = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const apiParams = {
      ...state.searchParams,
      page: state.page.currentPage,
    };

    try {
      const response = await fetchMerchants({
        params: apiParams,
      });
      setState(prev => ({ 
        ...prev, 
        merchants: response.items, 
        isLoading: false, 
        error: null, 
        page: response.page,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch merchants'),
      }));
    }
  }, [state.searchParams, state.page.currentPage]);

  const setSearchParams = useCallback((newParams: MerchantSearchParams) => {
    setState(prev => ({ ...prev, searchParams: { ...prev.searchParams, ...newParams }, page: { ...prev.page, currentPage: 1 } }));
  }, []);

  const setPage = useCallback((newPage: number) => {
    setState(prev => ({ ...prev, page: { ...prev.page, currentPage: newPage } }));
  }, []);

  const updateMerchant = useCallback(async (id: number, value: Partial<Merchant>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedMerchant = await updateMerchantApi({ id, merchant: value });
      setState(prev => ({
        ...prev,
        merchants: prev.merchants.map(merchant =>
          merchant.id === id ? updatedMerchant : merchant
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error : new Error('Failed to update merchant') }));
    }
  }, []);

  useEffect(() => {
    getMerchants();
  }, [getMerchants]);
  return {
    ...state,
    setSearchParams,
    setPage,
    updateMerchant,
  };
}