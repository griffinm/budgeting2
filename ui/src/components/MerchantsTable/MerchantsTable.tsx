import { MerchantCategory, MerchantGroup, Merchant } from "@/utils/types";
import { MerchantRow } from "./MerchantRow";
import { UpdateMerchantParams } from "@/api/merchant-client";
import { Loading } from "../Loading";
import { IconSearchOff } from "@tabler/icons-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function MerchantsTable({
  merchants,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  onUpdateMerchant,
  allMerchantCategories,
  allMerchantGroups,
  onUpdateMerchantGroup,
  onGroupCreated,
  scrollCacheKey,
}: {
  merchants: Merchant[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onUpdateMerchant: (params: UpdateMerchantParams) => void;
  allMerchantCategories: MerchantCategory[];
  allMerchantGroups: MerchantGroup[];
  onUpdateMerchantGroup: (merchantId: number, groupId: number | null) => void;
  onGroupCreated?: (group: MerchantGroup) => void;
  scrollCacheKey?: string;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMerchants, setDisplayMerchants] = useState(merchants);

  // Debounced scroll position saving
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = useCallback(() => {
    if (!scrollCacheKey) return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        sessionStorage.setItem(scrollCacheKey, String(scrollContainerRef.current.scrollTop));
      }
    }, 150);
  }, [scrollCacheKey]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [handleScroll]);

  // Restore scroll position after cached merchants render
  useLayoutEffect(() => {
    if (scrollRestoredRef.current || !scrollCacheKey) return;
    if (displayMerchants.length > 0 && !isLoading && scrollContainerRef.current) {
      const savedScroll = sessionStorage.getItem(scrollCacheKey);
      if (savedScroll !== null && Number(savedScroll) > 0) {
        scrollContainerRef.current.scrollTop = Number(savedScroll);
      }
      scrollRestoredRef.current = true;
    }
  }, [displayMerchants.length, isLoading, scrollCacheKey]);

  // Handle fade transition when loading new search results
  useEffect(() => {
    if (isLoading) {
      if (displayMerchants.length > 0) {
        setIsTransitioning(true);
        setTimeout(() => {
          setDisplayMerchants([]);
        }, 150);
      }
    } else {
      setDisplayMerchants(merchants);
      setIsTransitioning(false);
    }
  }, [isLoading, merchants, displayMerchants.length]);

  // Reset transition state if we get stuck
  useEffect(() => {
    if (!isLoading && !isLoadingMore && isTransitioning) {
      setIsTransitioning(false);
    }
  }, [isLoading, isLoadingMore, isTransitioning]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !scrollContainerRef.current || !hasMore || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        root: scrollContainerRef.current,
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, displayMerchants.length]);

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollContainerRef} className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        {isLoading && displayMerchants.length === 0 ? (
          <div className="flex flex-row justify-center transition-opacity duration-300 ease-in-out">
            <Loading fullHeight={false} />
          </div>
        ) : (
          <div className={`flex flex-col transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
            {displayMerchants.map(merchant => (
              <MerchantRow
                key={merchant.id}
                merchant={merchant}
                onUpdateMerchant={onUpdateMerchant}
                allMerchantCategories={allMerchantCategories}
                allMerchantGroups={allMerchantGroups}
                onUpdateMerchantGroup={onUpdateMerchantGroup}
                onGroupCreated={onGroupCreated}
              />
            ))}

            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && displayMerchants.length > 0 && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <Loading fullHeight={false} />
                ) : (
                  <div className="text-sm text-gray-500">Loading more...</div>
                )}
              </div>
            )}

            {!hasMore && displayMerchants.length > 0 && !isLoading && (
              <div className="flex justify-center py-4">
                <div className="text-sm text-gray-500">No more merchants to load</div>
              </div>
            )}

            {/* Show loading state during search */}
            {isLoading && displayMerchants.length > 0 && (
              <div className="flex justify-center py-4">
                <Loading fullHeight={false} />
              </div>
            )}

            {/* Show empty state when no merchants and not loading */}
            {displayMerchants.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconSearchOff size={32} className="text-gray-300 dark:text-gray-600" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No merchants found
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Try adjusting your search or filters
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
