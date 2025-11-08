import { useEffect, useState } from "react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { useMerchants } from "@/hooks";
import { MerchantsTable } from "@/components/MerchantsTable/MerchantsTable";
import { MerchantTag, MerchantGroup } from "@/utils/types";
import { fetchMerchantTags } from "@/api/merchant-tags-client";
import { fetchMerchantGroups, updateMerchantGroup } from "@/api/merchant-groups-client";
import { Card } from "@mantine/core";
import { Search } from "@/components/MerchantsTable/Search";

export default function MerchantsPage() {
  const [allMerchantTags, setAllMerchantTags] = useState<MerchantTag[]>([]);
  const [allMerchantGroups, setAllMerchantGroups] = useState<MerchantGroup[]>([]);

  const setTitle = usePageTitle();
  const { 
    merchants, 
    isLoading, 
    page, 
    setPage, 
    searchParams, 
    setSearchParams,
    updateMerchant,
  } = useMerchants({});

  useEffect(() => {
    setTitle(urls.merchants.title());
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchantTags, merchantGroups] = await Promise.all([
          fetchMerchantTags(),
          fetchMerchantGroups()
        ]);
        setAllMerchantTags(merchantTags || []);
        setAllMerchantGroups(merchantGroups || []);
      } catch (error) {
        console.error('Failed to fetch merchant data:', error);
        setAllMerchantTags([]);
        setAllMerchantGroups([]);
      }
    };
    fetchData();
  }, []);

  const handleGroupCreated = (newGroup: MerchantGroup) => {
    // Add the new group to the existing groups list
    setAllMerchantGroups(prev => [...prev, newGroup]);
  };

  const handleUpdateMerchantGroup = async (merchantId: number, groupId: number | null) => {
    try {
      // Find the current merchant to get their current group
      const merchant = merchants.find(m => m.id === merchantId);
      const currentGroupId = merchant?.merchantGroup?.id || null;
      
      await updateMerchantGroup(merchantId, groupId, currentGroupId);
      
      // Refresh the merchants data to reflect the change
      // Use setPage with current page to refresh without changing page
      setPage(page.currentPage);
    } catch (error) {
      console.error('Failed to update merchant group:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-5">
        <Search 
          searchParams={searchParams} 
          onSetSearchParams={setSearchParams}
          allMerchantGroups={allMerchantGroups}
        />
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end p-3">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} merchants`}
        </div>
      </div>
      <Card p={0} className="flex-1 min-h-0"> 
        <MerchantsTable
          allMerchantTags={allMerchantTags}
          allMerchantGroups={allMerchantGroups}
          onUpdateMerchant={updateMerchant}
          onUpdateMerchantGroup={handleUpdateMerchantGroup}
          onGroupCreated={handleGroupCreated}
          merchants={merchants}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
        />
      </Card>
    </div>
  );
}
