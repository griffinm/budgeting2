import { useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { MerchantsTable } from "@/components/MerchantsTable";
import { useMerchants, useMerchantTags } from "@/hooks";
import { CollapsibleCard } from "@/components/CollapsibleCard";
import { MerchantGroup } from "@/utils/types";
import { fetchMerchantGroups, updateMerchantGroup } from "@/api/merchant-groups-client";

export function Merchants({
  tagId,
}: {
  tagId: number;
}) {
  const [allMerchantGroups, setAllMerchantGroups] = useState<MerchantGroup[]>([]);
  
  const {
    merchants,
    isLoading,
    page,
    setPage,
    searchParams,
    setSearchParams,
    updateMerchant,
  } = useMerchants({ initialSearchParams: { merchantTagId: tagId } });
  const { merchantTags, loading } = useMerchantTags();

  useEffect(() => {
    const fetchMerchantGroupsData = async () => {
      try {
        const groups = await fetchMerchantGroups();
        setAllMerchantGroups(groups || []);
      } catch (error) {
        console.error('Failed to fetch merchant groups:', error);
        setAllMerchantGroups([]);
      }
    };
    fetchMerchantGroupsData();
  }, []);

  const handleUpdateMerchantGroup = async (merchantId: number, groupId: number | null) => {
    try {
      await updateMerchantGroup(merchantId, groupId);
      // Optionally refresh the merchants data here if needed
    } catch (error) {
      console.error('Failed to update merchant group:', error);
    }
  };

  return (
    <CollapsibleCard
      title="Merchants"
      initialState="collapsed"
    >
      {loading ? <Loading /> : (
        <MerchantsTable
          merchants={merchants}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          searchParams={searchParams}
          onSetSearchParams={setSearchParams}
          onUpdateMerchant={updateMerchant}
          allMerchantTags={merchantTags}
          allMerchantGroups={allMerchantGroups}
          onUpdateMerchantGroup={handleUpdateMerchantGroup}
        />
      )}
    </CollapsibleCard>
  );
}
