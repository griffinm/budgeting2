import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect } from "react";
import { MerchantCategoryTreeView } from "./MerchantCategoryTreeView";

export function MerchantTagsPage() {
  const setTitle = usePageTitle();

  useEffect(() => {
    setTitle(urls.merchantTags.title());
  }, [setTitle]);

  return (
    <MerchantCategoryTreeView  />
  );
}
