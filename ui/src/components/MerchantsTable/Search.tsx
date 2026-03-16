import { MerchantSearchParams } from "@/api";
import {
  TextInput,
  Select,
  Menu,
  UnstyledButton,
  Badge,
  CloseButton,
  Loader,
} from "@mantine/core";
import {
  IconSearch,
  IconArrowsSort,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconSortAscendingNumbers,
  IconSortDescendingNumbers,
  IconCheck,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { MerchantGroup } from "@/utils/types";

interface SortOption {
  sort_by: 'name' | 'transaction_count';
  sort_direction: 'asc' | 'desc';
  label: string;
  icon: React.ReactNode;
}

const SORT_OPTIONS: SortOption[] = [
  { sort_by: 'name', sort_direction: 'asc', label: 'Name A → Z', icon: <IconSortAscendingLetters size={16} /> },
  { sort_by: 'name', sort_direction: 'desc', label: 'Name Z → A', icon: <IconSortDescendingLetters size={16} /> },
  { sort_by: 'transaction_count', sort_direction: 'desc', label: 'Most transactions', icon: <IconSortDescendingNumbers size={16} /> },
  { sort_by: 'transaction_count', sort_direction: 'asc', label: 'Fewest transactions', icon: <IconSortAscendingNumbers size={16} /> },
];

export function Search({
  searchParams,
  onSetSearchParams,
  allMerchantGroups,
  totalCount,
  isLoading,
  onClearSearchParams,
}: {
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  allMerchantGroups: MerchantGroup[];
  totalCount?: number;
  isLoading?: boolean;
  onClearSearchParams?: () => void;
}) {
  const [search, setSearch] = useState(searchParams.search_term || '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateSearchTerm = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onSetSearchParams({ ...searchParams, search_term: value || undefined });
    }, 250);
  };

  const clearSearch = () => {
    setSearch('');
    onSetSearchParams({ ...searchParams, search_term: undefined });
    searchInputRef.current?.focus();
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

  const currentSort = SORT_OPTIONS.find(
    o => o.sort_by === currentSortBy && o.sort_direction === currentSortDirection
  ) || SORT_OPTIONS[0];

  const activeGroupName = allMerchantGroups.find(
    g => g.id === searchParams.merchant_group_id
  )?.name;

  const hasActiveFilters = !!(searchParams.search_term || searchParams.merchant_group_id);

  const clearAllFilters = () => {
    setSearch('');
    if (onClearSearchParams) {
      onClearSearchParams();
    } else {
      onSetSearchParams({});
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TextInput
          ref={searchInputRef}
          placeholder="Search merchants..."
          value={search}
          onChange={(event) => updateSearchTerm(event.target.value)}
          leftSection={<IconSearch size={16} className="text-gray-400" />}
          rightSection={
            search ? (
              <CloseButton size="sm" onClick={clearSearch} aria-label="Clear search" />
            ) : null
          }
          className="flex-1 max-w-xs"
          size="sm"
        />

        <Select
          placeholder="All groups"
          value={searchParams.merchant_group_id?.toString() || null}
          onChange={updateMerchantGroupFilter}
          data={allMerchantGroups.map(group => ({
            value: group.id.toString(),
            label: group.name,
          }))}
          clearable
          searchable
          size="sm"
          leftSection={<IconFilter size={16} className="text-gray-400" />}
          className="max-w-[200px]"
        />

        <Menu shadow="md" width={220} position="bottom-start">
          <Menu.Target>
            <UnstyledButton
              className="flex items-center gap-1.5 px-3 h-[30px] rounded-md text-sm
                border border-[var(--mantine-color-default-border)]
                bg-[var(--mantine-color-body)]
                hover:bg-[var(--mantine-color-default-hover)]
                text-[var(--mantine-color-text)]
                transition-colors"
            >
              <IconArrowsSort size={16} className="text-gray-400 shrink-0" />
              <span className="truncate">{currentSort.label}</span>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Sort by</Menu.Label>
            {SORT_OPTIONS.map((option) => (
              <Menu.Item
                key={`${option.sort_by}-${option.sort_direction}`}
                leftSection={option.icon}
                rightSection={
                  option.sort_by === currentSortBy && option.sort_direction === currentSortDirection
                    ? <IconCheck size={14} />
                    : null
                }
                onClick={() => updateSort(option.sort_by, option.sort_direction)}
              >
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <Loader size={14} />
          ) : (
            totalCount != null && (
              <span>
                {totalCount.toLocaleString()} merchant{totalCount !== 1 ? 's' : ''}
              </span>
            )
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-1.5">
          {searchParams.search_term && (
            <Badge
              variant="light"
              size="sm"
              rightSection={
                <CloseButton
                  size={14}
                  onClick={clearSearch}
                  variant="transparent"
                  className="ml-0.5"
                />
              }
            >
              Search: {searchParams.search_term}
            </Badge>
          )}

          {activeGroupName && (
            <Badge
              variant="light"
              size="sm"
              rightSection={
                <CloseButton
                  size={14}
                  onClick={() => updateMerchantGroupFilter(null)}
                  variant="transparent"
                  className="ml-0.5"
                />
              }
            >
              Group: {activeGroupName}
            </Badge>
          )}

          <UnstyledButton
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600
              dark:hover:text-gray-300 transition-colors ml-1"
          >
            <IconX size={12} />
            Clear all
          </UnstyledButton>
        </div>
      )}
    </div>
  );
}
