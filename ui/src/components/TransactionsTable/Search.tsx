import { ActionIcon, Badge } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { IconFilter, IconFilterOff } from "@tabler/icons-react";
import { countActiveFilters } from "./SearchFilters";

export function Search({
  searchParams,
  showFilters,
  onToggleFilters,
}: {
  searchParams: TransactionSearchParams;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  const activeCount = countActiveFilters(searchParams);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <ActionIcon
          variant={showFilters ? "filled" : "light"}
          color={activeCount > 0 ? "primary" : "gray"}
          size="lg"
          onClick={onToggleFilters}
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
  );
}
