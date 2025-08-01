import { Loading } from "@/components/Loading";
import { MerchantsTable } from "@/components/MerchantsTable";
import { useMerchants, useMerchantTags } from "@/hooks";
import { CollapsibleCard } from "@/components/CollapsibleCard";

export function Merchants({
  tagId,
}: {
  tagId: number;
}) {
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
        />
      )}
    </CollapsibleCard>
  );
}
