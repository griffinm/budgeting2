/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState, useEffect } from "react";
import { Button, Checkbox, Drawer, Input, MultiSelect, Select, TextInput } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { PlaidAccount, Tag, TransactionType } from "@/utils/types";

const SEARCH_TIMEOUT = 250;

export function SearchDrawer({
  searchParams,
  onSetSearchParams,
  clearSearchParams,
  plaidAccounts = [],
  tags = [],
  opened,
  onClose,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
  clearSearchParams: () => void;
  plaidAccounts?: PlaidAccount[];
  tags?: Tag[];
  opened: boolean;
  onClose: () => void;
}) {
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

  const handleClear = () => {
    clearSearchParams();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="85%"
      title="Search Transactions"
      radius="lg lg 0 0"
      styles={{
        header: { paddingBottom: 0 },
        body: { paddingTop: 12 },
        content: { borderRadius: '16px 16px 0 0' },
      }}
    >
      <div className="flex flex-col gap-3 overflow-y-auto pb-6">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => updateSearchTerm(e.target.value)}
          size="md"
        />

        <div className="grid grid-cols-2 gap-3">
          <DatePickerInput
            label="Start Date"
            value={localParams.start_date}
            onChange={(date) => updateLocalParam('start_date', date)}
            popoverProps={{ withinPortal: false }}
          />
          <DatePickerInput
            label="End Date"
            value={localParams.end_date}
            onChange={(date) => updateLocalParam('end_date', date)}
            popoverProps={{ withinPortal: false }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Amount Greater Than"
            type="number"
            value={localParams.amount_greater_than || ''}
            onChange={(e) => updateLocalParam('amount_greater_than', e.target.value)}
          />
          <TextInput
            label="Amount Less Than"
            type="number"
            value={localParams.amount_less_than || ''}
            onChange={(e) => updateLocalParam('amount_less_than', e.target.value)}
          />
        </div>

        <TextInput
          label="Amount Equal To"
          type="number"
          value={localParams.amount_equal_to || ''}
          onChange={(e) => updateLocalParam('amount_equal_to', e.target.value)}
        />

        <Select
          label="Transaction Type"
          value={localParams.transaction_type}
          onChange={(value) => updateLocalParam('transaction_type', value as TransactionType)}
          data={[
            { value: '', label: 'All' },
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'transfer', label: 'Transfer' },
          ]}
          comboboxProps={{ withinPortal: false }}
        />

        <Checkbox
          label="Has No Category"
          checked={localParams.has_no_category}
          onChange={(e) => updateLocalParam('has_no_category', e.target.checked)}
        />

        <MultiSelect
          label="Filter by Accounts"
          placeholder="Select accounts"
          value={(localParams.plaid_account_ids || []).map(String)}
          onChange={(values) => updateLocalParam('plaid_account_ids', values.map(Number))}
          data={plaidAccounts.map((account) => ({
            value: String(account.id),
            label: account.nickname || account.plaidOfficialName || `Account ${account.plaidMask}`,
          }))}
          searchable
          clearable
          comboboxProps={{ withinPortal: false }}
        />

        <MultiSelect
          label="Filter by Tags"
          placeholder="Select tags"
          value={(localParams.tag_ids || []).map(String)}
          onChange={(values) => updateLocalParam('tag_ids', values.map(Number))}
          data={tags.map((tag) => ({ value: String(tag.id), label: tag.name }))}
          searchable
          clearable
          comboboxProps={{ withinPortal: false }}
        />

        <Button variant="subtle" color="gray" onClick={handleClear}>
          Clear Search
        </Button>
      </div>
    </Drawer>
  );
}
