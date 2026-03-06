import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { TransactionSearchParams } from "@/api/transaction-client";
import { PlaidAccount, Tag } from "@/utils/types";
import { SearchDrawer } from "./SearchDrawer";

function hasActiveFilters(params: TransactionSearchParams): boolean {
  return !!(
    params.search_term ||
    params.start_date ||
    params.end_date ||
    params.amount_greater_than ||
    params.amount_less_than ||
    params.amount_equal_to ||
    params.transaction_type ||
    params.has_no_category ||
    (params.plaid_account_ids && params.plaid_account_ids.length > 0) ||
    (params.tag_ids && params.tag_ids.length > 0)
  );
}

export function FooterActionBar({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts,
  tags,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  clearSearchParams: () => void;
  plaidAccounts?: PlaidAccount[];
  tags?: Tag[];
}) {
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const filtersActive = hasActiveFilters(searchParams);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200 bg-white/90 backdrop-blur-md">
          <button
            onClick={open}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-700 text-white text-sm font-medium shadow-lg active:scale-95 transition-transform"
          >
            <IconSearch size={18} />
            Search
            {filtersActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      <SearchDrawer
        searchParams={searchParams}
        onSetSearchParams={onSetSearchParams}
        clearSearchParams={clearSearchParams}
        plaidAccounts={plaidAccounts}
        tags={tags}
        opened={drawerOpened}
        onClose={close}
      />
    </>
  );
}
