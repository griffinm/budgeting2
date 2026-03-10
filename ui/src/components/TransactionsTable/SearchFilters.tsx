/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState, useEffect } from "react";
import { Button, MultiSelect, SegmentedControl, Switch, TextInput } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { PlaidAccount, Tag, TransactionType } from "@/utils/types";
import { IconCurrencyDollar } from "@tabler/icons-react";

const SEARCH_TIMEOUT = 250;

function deduplicateOptions(options: { value: string; label: string }[]) {
  const seen = new Set<string>();
  return options.filter((opt) => {
    if (seen.has(opt.value)) return false;
    seen.add(opt.value);
    return true;
  });
}

export interface SearchFiltersProps {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  clearSearchParams: () => void;
  plaidAccounts?: PlaidAccount[];
  tags?: Tag[];
  withinPortal?: boolean;
  totalCount?: number;
  isLoading?: boolean;
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}

export function SearchFilters({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts = [],
  tags = [],
  withinPortal = true,
  totalCount,
  isLoading,
}: SearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [localParams, setLocalParams] = useState<TransactionSearchParams>(searchParams);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalParams(searchParams);
    setSearch(searchParams.search_term || '');
  }, [searchParams]);

  const debouncedSetSearchParams = (newParams: TransactionSearchParams) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onSetSearchParams(newParams);
    }, SEARCH_TIMEOUT);
  };

  const updateSearchTerm = (value: string) => {
    setSearch(value);
    const newParams = { ...localParams, search_term: value };
    setLocalParams(newParams);
    debouncedSetSearchParams(newParams);
  };

  const updateLocalParam = (key: keyof TransactionSearchParams, value: any) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    debouncedSetSearchParams(newParams);
  };

  const portalProps = withinPortal ? {} : { withinPortal: false };

  return (
    <div className="flex flex-col gap-5">
      <TextInput
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => updateSearchTerm(e.target.value)}
        size="md"
        styles={{ input: { borderRadius: 10 } }}
      />

      {totalCount !== undefined && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? 'Searching...' : `${totalCount.toLocaleString()} transaction${totalCount !== 1 ? 's' : ''} found`}
        </div>
      )}

      <FilterSection label="Type">
        <SegmentedControl
          value={localParams.transaction_type || ''}
          onChange={(value) => updateLocalParam('transaction_type', value as TransactionType)}
          data={[
            { value: '', label: 'All' },
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'transfer', label: 'Transfer' },
          ]}
          fullWidth
          size="sm"
        />
        <Switch
          label="Uncategorized only"
          checked={localParams.has_no_category || false}
          onChange={(e) => updateLocalParam('has_no_category', e.currentTarget.checked)}
          size="sm"
        />
      </FilterSection>

      <FilterSection label="Date Range">
        <div className="grid grid-cols-2 gap-3">
          <DatePickerInput
            placeholder="From"
            value={localParams.start_date}
            onChange={(date) => updateLocalParam('start_date', date)}
            clearable
            popoverProps={portalProps}
          />
          <DatePickerInput
            placeholder="To"
            value={localParams.end_date}
            onChange={(date) => updateLocalParam('end_date', date)}
            clearable
            popoverProps={portalProps}
          />
        </div>
      </FilterSection>

      <FilterSection label="Amount">
        <div className="grid grid-cols-3 gap-3">
          <TextInput
            placeholder="Min"
            type="number"
            value={localParams.amount_greater_than || ''}
            onChange={(e) => updateLocalParam('amount_greater_than', e.target.value)}
            leftSection={<IconCurrencyDollar size={16} />}
          />
          <TextInput
            placeholder="Max"
            type="number"
            value={localParams.amount_less_than || ''}
            onChange={(e) => updateLocalParam('amount_less_than', e.target.value)}
            leftSection={<IconCurrencyDollar size={16} />}
          />
          <TextInput
            placeholder="Exact"
            type="number"
            value={localParams.amount_equal_to || ''}
            onChange={(e) => updateLocalParam('amount_equal_to', e.target.value)}
            leftSection={<IconCurrencyDollar size={16} />}
          />
        </div>
      </FilterSection>

      <FilterSection label="Filter By">
        <MultiSelect
          placeholder="Accounts"
          value={(localParams.plaid_account_ids || []).map(String)}
          onChange={(values) => updateLocalParam('plaid_account_ids', values.map(Number))}
          data={deduplicateOptions(plaidAccounts.map((account) => ({
            value: String(account.id),
            label: account.nickname || account.plaidOfficialName || `Account ${account.plaidMask}`,
          })))}
          searchable
          clearable
          comboboxProps={portalProps}
        />
        <MultiSelect
          placeholder="Tags"
          value={(localParams.tag_ids || []).map(String)}
          onChange={(values) => updateLocalParam('tag_ids', values.map(Number))}
          data={deduplicateOptions(tags.map((tag) => ({ value: String(tag.id), label: tag.name })))}
          searchable
          clearable
          comboboxProps={portalProps}
        />
      </FilterSection>

      <Button variant="subtle" color="gray" size="sm" onClick={clearSearchParams}>
        Clear all filters
      </Button>
    </div>
  );
}

export function countActiveFilters(params: TransactionSearchParams): number {
  let count = 0;
  if (params.search_term) count++;
  if (params.start_date || params.end_date) count++;
  if (params.amount_greater_than || params.amount_less_than || params.amount_equal_to) count++;
  if (params.transaction_type) count++;
  if (params.has_no_category) count++;
  if (params.plaid_account_ids && params.plaid_account_ids.length > 0) count++;
  if (params.tag_ids && params.tag_ids.length > 0) count++;
  return count;
}
