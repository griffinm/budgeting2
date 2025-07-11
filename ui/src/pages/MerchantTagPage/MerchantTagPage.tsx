import { usePageTitle } from "@/hooks";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { MerchantTag } from "@/utils/types";
import { Breadcrumbs, Card } from "@mantine/core";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { useMerchantTagPageData } from "./hooks";
import { TransactionsTable } from "@/components/TransactionsTable";

export default function MerchantTagPage() {
  const setTitle = usePageTitle();

  const {
    merchantTag,
    merchantTagLoading,
    transactions,
    transactionsLoading,
    transactionsPage,
    setTransactionsPage,
    transactionCount,
    transactionPageCount,
    merchantTags,
    merchantTagsLoading,
  } = useMerchantTagPageData();

  useEffect(() => {
    setTitle(urls.merchantTag.title(merchantTag?.name || ''));
  }, [setTitle, merchantTag]);

  if (merchantTagLoading) {
    return <Loading />
  }

  return (
    <>
      <Header merchantTag={merchantTag} />
      <Card>
        <h2 className="text-lg font-bold">Transactions</h2>

        {transactionsLoading ? (
          <Loading />
        ) : (
          <TransactionsTable
            transactions={transactions}
            isLoading={transactionsLoading}
            error={null}
            page={{
              currentPage: transactionsPage,
              totalCount: transactionCount,
              totalPages: transactionPageCount,
            }}
            setPage={setTransactionsPage}
            setPerPage={() => {}}
            searchParams={{}}
            onSetSearchParams={() => {}}
            merchantTags={merchantTags}
            showSearch={false}
            clearSearchParams={() => {}}
            updateTransaction={() => {}}
          />
        )}
      </Card>
      <Card>
        <h2 className="text-lg font-bold">Transactions</h2>
        <TransactionsTable
          transactions={transactions}
          isLoading={transactionsLoading}
          error={null}
          page={{
            currentPage: transactionsPage,
            totalCount: transactionCount,
            totalPages: transactionPageCount,
          }}
          setPage={setTransactionsPage}
          setPerPage={() => {}}
          searchParams={{}}
          onSetSearchParams={() => {}}
          merchantTags={merchantTags}
          clearSearchParams={() => {}}
          updateTransaction={() => {}}
        />
      </Card>
    </>
  )
}

function Header({ merchantTag }: { merchantTag: MerchantTag | null }) {
  return (
    <div className="mb-4">
      <Breadcrumbs className="mb-4">
        <Link to={urls.merchantTags.path()}>Categories</Link>
        <span>{merchantTag?.name}</span>
      </Breadcrumbs>
      <div className="flex flex-row items-center gap-2">
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `#${merchantTag?.color}` }}></div>
        <h1 className="text-2xl font-bold">{merchantTag?.name}</h1>
      </div>
    </div>
  )
}