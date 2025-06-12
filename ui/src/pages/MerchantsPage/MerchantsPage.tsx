import { useEffect, useState } from "react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { useMerchants } from "@/hooks";
import { MerchantsTable } from "@/components/MerchantsTable/MerchantsTable";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTags } from "@/api/merchant-tags-client";

export function MerchantsPage() {
  const [allMerchantTags, setAllMerchantTags] = useState<MerchantTag[]>([]);

  const setTitle = usePageTitle();
  const { 
    merchants, 
    isLoading, 
    page, 
    setPage, 
    searchParams, 
    setSearchParams,
    updateMerchant,
  } = useMerchants();
  
  useEffect(() => {
    setTitle(urls.merchants.title());
  }, [setTitle]);

  useEffect(() => {
    const fetchAllMerchantTags = async () => {
      const allMerchantTags = await fetchMerchantTags();
      setAllMerchantTags(allMerchantTags);
    }
    fetchAllMerchantTags();
  }, []);

  return (
    <div>
      <MerchantsTable
        allMerchantTags={allMerchantTags}
        onUpdateMerchant={updateMerchant}
        merchants={merchants}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        searchParams={searchParams}
        onSetSearchParams={setSearchParams}
      />
    </div>
  );
}
