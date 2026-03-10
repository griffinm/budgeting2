import { useState } from "react";
import { ActionIcon, Badge, Collapse } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { PlaidAccount, Tag } from "@/utils/types";
import { IconFilter, IconFilterOff } from "@tabler/icons-react";
import { SearchFilters, countActiveFilters } from "./SearchFilters";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function Search({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts = [],
  tags = [],
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
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = countActiveFilters(searchParams);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <ActionIcon
            variant={showFilters ? "filled" : "light"}
            color={activeCount > 0 ? "primary" : "gray"}
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            {showFilters ? <IconFilterOff size={18} /> : <IconFilter size={18} />}
          </ActionIcon>
          {activeCount > 0 && !showFilters && (
            <Badge
              size="xs"
              circle
              className="absolute -top-1.5 -right-1.5 pointer-events-none"
              color="red"
            >
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && !showFilters && (
          <span className="text-xs text-gray-400">
            {activeCount} filter{activeCount !== 1 ? 's' : ''} active
          </span>
        )}
      </div>

      <Collapse in={showFilters}>
        <div className="pt-1 pb-2 max-w-xl">
          <ErrorBoundary>
            <SearchFilters
              searchParams={searchParams}
              onSetSearchParams={onSetSearchParams}
              clearSearchParams={clearSearchParams}
              plaidAccounts={plaidAccounts}
              tags={tags}
              totalCount={totalCount}
              isLoading={isLoading}
            />
          </ErrorBoundary>
        </div>
      </Collapse>
    </div>
  );
}
