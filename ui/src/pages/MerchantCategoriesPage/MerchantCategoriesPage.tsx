import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect } from "react";
import { MerchantCategoryTree } from "@/components/MerchantCategoryTree";

export default function MerchantCategoriesPage() {
  const setTitle = usePageTitle();

  useEffect(() => {
    setTitle(urls.merchantCategories.title());
  }, [setTitle]);

  return <MerchantCategoryTree.View />;
}
