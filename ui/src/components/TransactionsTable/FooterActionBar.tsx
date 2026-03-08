import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { TransactionSearchParams } from "@/api/transaction-client";
import { PlaidAccount, Tag } from "@/utils/types";
import { SearchDrawer } from "./SearchDrawer";
import { countActiveFilters } from "./SearchFilters";

export function FooterActionBar({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts,
  tags,
  totalCount,
  isLoading,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  clearSearchParams: () => void;
  plaidAccounts?: PlaidAccount[];
  tags?: Tag[];
  totalCount?: number;
  isLoading?: boolean;
}) {
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const activeCount = countActiveFilters(searchParams);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-[var(--mantine-color-dark-7)]/90 backdrop-blur-md">
          <button
            onClick={open}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-700 text-white text-sm font-medium shadow-lg active:scale-95 transition-transform"
          >
            <IconSearch size={18} />
            {activeCount > 0 ? `${activeCount} Filter${activeCount !== 1 ? 's' : ''}` : 'Search'}
            {activeCount > 0 && (
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
        totalCount={totalCount}
        isLoading={isLoading}
      />
    </>
  );
}
