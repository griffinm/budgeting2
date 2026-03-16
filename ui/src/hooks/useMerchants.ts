import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchMerchants,
  MerchantSearchParams,
  updateMerchant as updateMerchantApi,
  UpdateMerchantParams,
} from '@/api';
import { Page, Merchant } from '@/utils/types';

const SEARCH_PARAMS_KEY = "merchantSearch";
const MERCHANTS_CACHE_KEY = "merchantsCache";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

function localStorageBaseKey() {
  const url = window.location.pathname;
  const urlKey = url.split('/').join('-');
  return `${urlKey}-${SEARCH_PARAMS_KEY}`;
}

function sessionStorageCacheKey(pathname: string) {
  const urlKey = pathname.split('/').join('-');
  return `${urlKey}-${MERCHANTS_CACHE_KEY}`;
}

interface MerchantsCache {
  merchants: Merchant[];
  page: Page;
  hasMore: boolean;
  searchParams: MerchantSearchParams;
  timestamp: number;
}

function saveMerchantsCache(key: string, data: Omit<MerchantsCache, 'timestamp'>) {
  sessionStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
}

function getMerchantsCache(key: string): MerchantsCache | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    const cache: MerchantsCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_MAX_AGE_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

function clearMerchantsCache(key: string, { keepScroll = false } = {}) {
  sessionStorage.removeItem(key);
  if (!keepScroll) {
    sessionStorage.removeItem(`${key}-scroll`);
  }
}

function saveSearchToLocalStorage(search: MerchantSearchParams) {
  const { page, per_page, ...searchWithoutPagination } = search;
  localStorage.setItem(localStorageBaseKey(), JSON.stringify(searchWithoutPagination));
}

function getSearchFromLocalStorage(): MerchantSearchParams | null {
  const search = localStorage.getItem(localStorageBaseKey());
  return search ? JSON.parse(search) : null;
}

function clearSearchFromLocalStorage() {
  localStorage.removeItem(localStorageBaseKey());
}

interface MerchantState {
  merchants: Merchant[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  searchParams: MerchantSearchParams;
  setSearchParams: (searchParams: MerchantSearchParams) => void;
  page: Page;
  hasMore: boolean;
  updateMerchant: (params: UpdateMerchantParams) => void;
}

export const useMerchants = ({
  initialSearchParams = {},
}: {
  initialSearchParams?: MerchantSearchParams;
} = {}) => {
  const cacheKeyRef = useRef(sessionStorageCacheKey(window.location.pathname));
  const currentSearchParams = getSearchFromLocalStorage() ?? initialSearchParams ?? {};
  const rawCache = useRef(getMerchantsCache(cacheKeyRef.current)).current;

  const cache = rawCache && JSON.stringify(rawCache.searchParams) === JSON.stringify(currentSearchParams)
    ? rawCache : null;

  clearMerchantsCache(cacheKeyRef.current, { keepScroll: !!cache });

  const [state, setState] = useState<MerchantState>({
    searchParams: currentSearchParams,
    setSearchParams: () => {},
    merchants: cache?.merchants ?? [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    updateMerchant: () => {},
    hasMore: cache?.hasMore ?? true,
    page: cache?.page ?? {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
  });

  const currentPageRef = useRef(cache?.page?.currentPage ?? 1);
  const searchParamsRef = useRef(state.searchParams);
  const stateRef = useRef(state);

  useEffect(() => {
    currentPageRef.current = state.page.currentPage;
    searchParamsRef.current = state.searchParams;
    stateRef.current = state;
  }, [state]);

  const fetchMerchantsData = useCallback(async (isLoadingMore = false) => {
    const currentPage = isLoadingMore ? currentPageRef.current + 1 : currentPageRef.current;
    const searchParams = searchParamsRef.current;

    setState(prev => {
      if (isLoadingMore) {
        return {
          ...prev,
          isLoadingMore: true,
          error: null,
          page: { ...prev.page, currentPage },
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
      const response = await fetchMerchants({ params: apiParams });

      const newMerchants = response.items || [];
      const hasMore = currentPage < (response.page?.totalPages ?? 1);

      setState(prev => {
        let updatedMerchants: Merchant[];

        if (isLoadingMore) {
          const existingIds = new Set(prev.merchants.map(m => m.id));
          const uniqueNewMerchants = newMerchants.filter(m => !existingIds.has(m.id));
          updatedMerchants = [...prev.merchants, ...uniqueNewMerchants];
        } else {
          updatedMerchants = newMerchants;
        }

        return {
          ...prev,
          merchants: updatedMerchants,
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
        error: error instanceof Error ? error : new Error('Failed to fetch merchants'),
      }));
    }
  }, []);

  const setSearchParams = useCallback((newParams: MerchantSearchParams) => {
    clearMerchantsCache(cacheKeyRef.current);
    setState(prev => {
      const updatedSearchParams = { ...prev.searchParams, ...newParams };

      searchParamsRef.current = updatedSearchParams;
      currentPageRef.current = 1;

      setTimeout(() => {
        fetchMerchantsData();
      }, 0);

      return {
        ...prev,
        searchParams: updatedSearchParams,
        page: { ...prev.page, currentPage: 1 },
        hasMore: true,
      };
    });
  }, [fetchMerchantsData]);

  const loadMore = useCallback(() => {
    setState(prev => {
      if (prev.hasMore && !prev.isLoadingMore) {
        fetchMerchantsData(true);
      }
      return prev;
    });
  }, [fetchMerchantsData]);

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

  const clearSearchParams = useCallback(() => {
    clearSearchFromLocalStorage();
    clearMerchantsCache(cacheKeyRef.current);
    setState(prev => {
      searchParamsRef.current = {};
      currentPageRef.current = 1;

      setTimeout(() => {
        fetchMerchantsData();
      }, 0);

      return {
        ...prev,
        searchParams: {},
        page: { ...prev.page, currentPage: 1 },
        hasMore: true,
      };
    });
  }, [fetchMerchantsData]);

  // Initial fetch — skip if restored from cache
  useEffect(() => {
    if (stateRef.current.merchants.length > 0) {
      return;
    }
    fetchMerchantsData();
  }, [fetchMerchantsData]);

  // Save cache on unmount
  useEffect(() => {
    const key = cacheKeyRef.current;
    return () => {
      const currentState = stateRef.current;
      if (currentState.merchants.length > 0) {
        saveMerchantsCache(key, {
          merchants: currentState.merchants,
          page: currentState.page,
          hasMore: currentState.hasMore,
          searchParams: currentState.searchParams,
        });
      }
    };
  }, []);

  return {
    ...state,
    loadMore,
    setSearchParams,
    updateMerchant,
    clearSearchParams,
    scrollCacheKey: `${cacheKeyRef.current}-scroll`,
  };
};
