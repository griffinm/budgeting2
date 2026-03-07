import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { Breadcrumbs } from "@mantine/core";
import { MerchantCategory } from "@/utils/types";
import { fetchMerchantCategory } from "@/api/merchant-categories-client";
import { Merchants } from "./Merchants";
import { Transactions } from "./Transactions";
import { TrendReport } from "./TrendReport";

export default function MerchantCategoryPage() {
  const { id } = useParams();
  const [merchantCategory, setMerchantCategory] = useState<MerchantCategory | null>(null);
  const [merchantCategoryLoading, setMerchantCategoryLoading] = useState(true);

  // Set the title of the page
  const setTitle = usePageTitle();
  useEffect(() => {
    if (merchantCategory) {
      setTitle(urls.merchantCategory.title({ categoryName: merchantCategory.name }));
    }
  }, [setTitle, merchantCategory]);

  // Load the merchant category
  useEffect(() => {
    setMerchantCategoryLoading(true);
    fetchMerchantCategory({ categoryId: Number(id) }).then(setMerchantCategory)
      .finally(() => setMerchantCategoryLoading(false));
  }, [id]);

  if (merchantCategoryLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.merchantCategories.path()}>Categories</Link>
        <span>{merchantCategory?.name}</span>
      </Breadcrumbs>

      <div className="flex flex-col md:flex-row justify-between mb-3">
        <h1 className="text-2xl font-bold mb-4">{merchantCategory?.name}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <TrendReport tagId={Number(id)} />

        <Merchants tagId={Number(id)} />

        <Transactions tagId={Number(id)} />
      </div>
    </div>
  );
}
