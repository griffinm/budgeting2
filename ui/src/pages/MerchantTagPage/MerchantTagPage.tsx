import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { Breadcrumbs } from "@mantine/core";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTag } from "@/api/merchant-tags-client";
import { Merchants } from "./Merchants";
import { Transactions } from "./Transactions";

export default function MerchantTagPage() {
  const { id } = useParams();
  const [merchantTag, setMerchantTag] = useState<MerchantTag | null>(null);
  const [merchantTagLoading, setMerchantTagLoading] = useState(true);

  // Set the title of the page
  const setTitle = usePageTitle();
  useEffect(() => {
    if (merchantTag) {
      setTitle(urls.merchantTag.title({ tagName: merchantTag.name }));
    }
  }, [setTitle, merchantTag]);

  // Load the merchant tag
  useEffect(() => {
    setMerchantTagLoading(true);
    fetchMerchantTag({ tagId: Number(id) }).then(setMerchantTag)
      .finally(() => setMerchantTagLoading(false));
  }, [id]);

  if (merchantTagLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.merchantTags.path()}>Categories</Link>
        <span>{merchantTag?.name}</span>
      </Breadcrumbs>

      <div className="flex flex-col md:flex-row justify-between mb-3">
        <h1 className="text-2xl font-bold mb-4">{merchantTag?.name}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Merchants tagId={Number(id)} />

        <Transactions tagId={Number(id)} />
      </div>
    </div>
  );
}
