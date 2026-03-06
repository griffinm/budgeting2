import { Badge, Drawer } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { PlaidAccount, Tag } from "@/utils/types";
import { SearchFilters, countActiveFilters } from "./SearchFilters";

export function SearchDrawer({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts = [],
  tags = [],
  opened,
  onClose,
  totalCount,
  isLoading,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  clearSearchParams: () => void;
  plaidAccounts?: PlaidAccount[];
  tags?: Tag[];
  opened: boolean;
  onClose: () => void;
  totalCount?: number;
  isLoading?: boolean;
}) {
  const activeCount = countActiveFilters(searchParams);

  const handleClear = () => {
    clearSearchParams();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="70%"
      title={
        <div className="flex items-center gap-2">
          <span className="font-semibold">Filters</span>
          {activeCount > 0 && (
            <Badge size="sm" circle color="red">{activeCount}</Badge>
          )}
        </div>
      }
      styles={{
        header: { paddingBottom: 0 },
        body: { paddingTop: 12, overflowY: 'auto', flex: 1 },
        content: { borderRadius: '16px 16px 0 0' },
      }}
    >
      <div className="pb-6">
        <SearchFilters
          searchParams={searchParams}
          onSetSearchParams={onSetSearchParams}
          clearSearchParams={handleClear}
          plaidAccounts={plaidAccounts}
          tags={tags}
          withinPortal={false}
          totalCount={totalCount}
          isLoading={isLoading}
        />
      </div>
    </Drawer>
  );
}
