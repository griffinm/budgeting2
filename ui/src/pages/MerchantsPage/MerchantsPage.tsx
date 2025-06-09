import { useEffect } from "react";
import { urls } from "@/utils/urls";
import { usePageTitle } from "@/hooks";
import { useMerchants } from "@/hooks";
import { MerchantsTable } from "@/components/MerchantsTable/MerchantsTable";

export function MerchantsPage() {
  const setTitle = usePageTitle();
  const { 
    merchants, 
    isLoading, 
    error, 
    page, 
    setPage, 
    searchParams, 
    setSearchParams,
    updateMerchant,
  } = useMerchants();
  
  useEffect(() => {
    setTitle(urls.transactions.title());
  }, [setTitle]);

  return (
    <div>
      <MerchantsTable
        onUpdateMerchant={updateMerchant}
        merchants={merchants}
        isLoading={isLoading}
        error={error}
        page={page}
        setPage={setPage}
        searchParams={searchParams}
        onSetSearchParams={setSearchParams}
        setPerPage={() => {}}
        setSearchParams={setSearchParams}
      />
    </div>
  );
}