import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  Select,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconSearch } from "@tabler/icons-react";
import { MerchantSearchParams } from "@/api";
import { MerchantGroup } from "@/utils/types";
import { SORT_OPTIONS } from "./Search";

const SEARCH_TIMEOUT = 250;

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}

export function countActiveFilters(params: MerchantSearchParams): number {
  let count = 0;
  if (params.search_term) count++;
  if (params.merchant_group_id) count++;
  return count;
}

export function SearchDrawer({
  searchParams,
  onSetSearchParams,
  onClearSearchParams,
  allMerchantGroups,
  opened,
  onClose,
  totalCount,
  isLoading,
}: {
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  onClearSearchParams?: () => void;
  allMerchantGroups: MerchantGroup[];
  opened: boolean;
  onClose: () => void;
  totalCount?: number;
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState(searchParams.search_term || '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCount = countActiveFilters(searchParams);

  useEffect(() => {
    setSearch(searchParams.search_term || '');
  }, [searchParams.search_term]);

  const updateSearchTerm = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onSetSearchParams({ ...searchParams, search_term: value || undefined });
    }, SEARCH_TIMEOUT);
  };

  const updateMerchantGroupFilter = (value: string | null) => {
    onSetSearchParams({
      ...searchParams,
      merchant_group_id: value ? Number(value) : undefined,
    });
  };

  const updateSort = (sort_by: 'name' | 'transaction_count', sort_direction: 'asc' | 'desc') => {
    onSetSearchParams({ ...searchParams, sort_by, sort_direction });
  };

  const currentSortBy = searchParams.sort_by || 'name';
  const currentSortDirection = searchParams.sort_direction || 'asc';

  const handleClear = () => {
    setSearch('');
    if (onClearSearchParams) {
      onClearSearchParams();
    } else {
      onSetSearchParams({});
    }
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
      <div className="flex flex-col gap-5 pb-6">
        <TextInput
          placeholder="Search merchants..."
          value={search}
          onChange={(e) => updateSearchTerm(e.target.value)}
          leftSection={<IconSearch size={16} className="text-gray-400" />}
          size="md"
          styles={{ input: { borderRadius: 10 } }}
        />

        {totalCount !== undefined && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Searching...' : `${totalCount.toLocaleString()} merchant${totalCount !== 1 ? 's' : ''} found`}
          </div>
        )}

        <FilterSection label="Group">
          <Select
            placeholder="All groups"
            value={searchParams.merchant_group_id?.toString() || null}
            onChange={updateMerchantGroupFilter}
            data={allMerchantGroups.map((group) => ({
              value: group.id.toString(),
              label: group.name,
            }))}
            clearable
            searchable
            comboboxProps={{ withinPortal: false }}
          />
        </FilterSection>

        <FilterSection label="Sort by">
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((option) => {
              const active =
                option.sort_by === currentSortBy && option.sort_direction === currentSortDirection;
              return (
                <UnstyledButton
                  key={`${option.sort_by}-${option.sort_direction}`}
                  onClick={() => updateSort(option.sort_by, option.sort_direction)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors
                    ${active
                      ? 'bg-[var(--mantine-color-default-hover)] text-[var(--mantine-color-text)] font-medium'
                      : 'text-[var(--mantine-color-text)] hover:bg-[var(--mantine-color-default-hover)]'}`}
                >
                  <span className="text-gray-400 shrink-0">{option.icon}</span>
                  <span className="flex-1 text-left">{option.label}</span>
                  {active && <IconCheck size={16} />}
                </UnstyledButton>
              );
            })}
          </div>
        </FilterSection>

        <Button variant="subtle" color="gray" size="sm" onClick={handleClear}>
          Clear all filters
        </Button>
      </div>
    </Drawer>
  );
}
