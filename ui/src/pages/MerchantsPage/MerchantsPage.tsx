import { useEffect, useState } from "react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { useMerchants } from "@/hooks";
import { MerchantsTable } from "@/components/MerchantsTable/MerchantsTable";
import { MerchantCategory, MerchantGroup } from "@/utils/types";
import { fetchMerchantCategories } from "@/api/merchant-categories-client";
import { fetchMerchantGroups, updateMerchantGroup } from "@/api/merchant-groups-client";
import { Card } from "@mantine/core";
import { Search } from "@/components/MerchantsTable/Search";

export default function MerchantsPage() {
  const [allMerchantCategories, setAllMerchantCategories] = useState<MerchantCategory[]>([]);
  const [allMerchantGroups, setAllMerchantGroups] = useState<MerchantGroup[]>([]);

  const setTitle = usePageTitle();
  const {
    merchants,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    page,
    searchParams,
    setSearchParams,
    clearSearchParams,
    updateMerchant,
    scrollCacheKey,
  } = useMerchants({});

  useEffect(() => {
    setTitle(urls.merchants.title());
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchantCategories, merchantGroups] = await Promise.all([
          fetchMerchantCategories(),
          fetchMerchantGroups()
        ]);
        setAllMerchantCategories(merchantCategories || []);
        setAllMerchantGroups(merchantGroups || []);
      } catch (error) {
        console.error('Failed to fetch merchant data:', error);
        setAllMerchantCategories([]);
        setAllMerchantGroups([]);
      }
    };
    fetchData();
  }, []);

  const handleGroupCreated = (newGroup: MerchantGroup) => {
    setAllMerchantGroups(prev => [...prev, newGroup]);
  };

  const handleUpdateMerchantGroup = async (merchantId: number, groupId: number | null) => {
    try {
      const merchant = merchants.find(m => m.id === merchantId);
      const currentGroupId = merchant?.merchantGroup?.id || null;

      await updateMerchantGroup(merchantId, groupId, currentGroupId);

      // Trigger re-fetch by re-setting current search params
      setSearchParams({ ...searchParams });
    } catch (error) {
      console.error('Failed to update merchant group:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="hidden md:block flex-shrink-0 mb-3">
        <Search
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          onClearSearchParams={clearSearchParams}
          allMerchantGroups={allMerchantGroups}
          totalCount={page.totalCount}
          isLoading={isLoading}
        />
      </div>
      <Card p={0} className="flex-1 min-h-0">
        <MerchantsTable
          allMerchantCategories={allMerchantCategories}
          allMerchantGroups={allMerchantGroups}
          onUpdateMerchant={updateMerchant}
          onUpdateMerchantGroup={handleUpdateMerchantGroup}
          onGroupCreated={handleGroupCreated}
          merchants={merchants}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
          scrollCacheKey={scrollCacheKey}
        />
      </Card>
    </div>
  );
}
