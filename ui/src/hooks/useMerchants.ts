/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchMerchants,
  MerchantSearchParams,
  updateMerchant as updateMerchantApi,
  UpdateMerchantParams,
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
  updateMerchant: (params: UpdateMerchantParams) => void;
}

export const useMerchants = ({ 
  initialSearchParams = {},
}: { 
  initialSearchParams?: MerchantSearchParams }
): MerchantState => {  
  const [state, setState] = useState<MerchantState>({
    merchants: [],
    isLoading: false,
    error: null,
    searchParams: initialSearchParams || {},
    setSearchParams: () => {},
    page: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
    setPage: () => {},
    updateMerchant: () => {},
  });

  const getMerchants = useCallback(async (searchParamsOverride?: MerchantSearchParams, pageOverride?: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const currentSearchParams = searchParamsOverride || state.searchParams;
    const currentPage = pageOverride || state.page.currentPage;

    try {
      const response = await fetchMerchants({
        params: {
          ...currentSearchParams,
          page: {
            page: currentPage,
            perPage: 25,
          },
        },
      });
      setState(prev => ({ 
        ...prev, 
        merchants: response.items, 
        isLoading: false, 
        error: null, 
        page: response.page,
      }));
    } catch (error) {
      console.error('API error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch merchants'),
      }));
    }
  }, []);

  const setSearchParams = useCallback((newParams: MerchantSearchParams) => {
    const updatedSearchParams = { ...state.searchParams, ...newParams };
    setState(prev => ({ 
      ...prev, 
      searchParams: updatedSearchParams, 
      page: { ...prev.page, currentPage: 1 } 
    }));
    getMerchants(updatedSearchParams, 1);
  }, [getMerchants]);

  const setPage = useCallback((newPage: number) => {
    setState(prev => ({ ...prev, page: { ...prev.page, currentPage: newPage } }));
    getMerchants(state.searchParams, newPage);
  }, [getMerchants, state.searchParams]);

  const updateMerchant = useCallback(async (params: UpdateMerchantParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedMerchant = await updateMerchantApi(params);
      setState(prev => ({
        ...prev,
        merchants: prev.merchants.map(merchant =>
          merchant.id === params.id ? updatedMerchant : merchant
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
  }, []);

  return {
    ...state,
    setSearchParams,
    setPage,
    updateMerchant,
  };
}
