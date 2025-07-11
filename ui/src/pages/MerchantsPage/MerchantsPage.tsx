import { useEffect, useState } from "react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { useMerchants } from "@/hooks";
import { MerchantsTable } from "@/components/MerchantsTable/MerchantsTable";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTags } from "@/api/merchant-tags-client";
import { Card } from "@mantine/core";

export default function MerchantsPage() {
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
      <h1 className="text-2xl font-bold mb-4">Merchants</h1>
      <Card>
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
      </Card>
    </div>
  );
}
