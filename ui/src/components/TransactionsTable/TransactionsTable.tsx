// import { TransactionSearchParams } from "@/api/transaction-client";
import { Transaction, Page, MerchantTag } from "@/utils/types";
import { Pagination } from "@mantine/core";
import { Search } from "./Search";
import { TransactionSearchParams, TransactionUpdateParams } from "@/api/transaction-client";
import { TableRow } from "./TableRow";
import { Loading } from "../Loading";
import { useMediaQuery } from '@mantine/hooks';

export function TransactionsTable({
  transactions,
  isLoading,
  page,
  setPage,
  searchParams,
  onSetSearchParams,
  updateTransaction,
  merchantTags,
  condensed = false,
  showSearch = true,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  page: Page;
  setPage: (page: number) => void;
  setPerPage: (per_page: number) => void;
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
  condensed?: boolean;
  showSearch?: boolean;
}) {
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} transactions`}
        </div>
        {showSearch && (
          <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} />
        )}
      </div>

      <div className="flex flex-row justify-center my-3">
        <Pagination
          size={isMobile ? 'xs' : 'md'}
          total={page.totalPages}
          value={page.currentPage}
          onChange={setPage}
          withEdges
          withControls
        />
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-row justify-center my-3">
            <Loading fullHeight={false} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                transaction={transaction}
                condensed={condensed}
                updateTransaction={updateTransaction}
                merchantTags={merchantTags}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-row justify-center my-3">
      <Pagination
          size={isMobile ? 'xs' : 'md'}
          total={page.totalPages}
          value={page.currentPage}
          onChange={setPage}
          withEdges
          withControls
        />
      </div>
    </div>
  )
}
