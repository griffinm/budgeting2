import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { useEffect } from "react";
import { MerchantCategoryTree } from "@/components/MerchantCategoryTree";
import { Card } from "@mantine/core";

export default function MerchantCategoriesPage() {
  const setTitle = usePageTitle();

  useEffect(() => {
    setTitle(urls.merchantCategories.title());
  }, [setTitle]);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <MerchantCategoryTree.View />
      </Card>
    </div>
  );
}
