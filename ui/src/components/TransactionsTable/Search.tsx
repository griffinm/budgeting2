/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState, useEffect } from "react";
import { Checkbox, Input, Select, TextInput } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { TransactionType } from "@/utils/types";

export function Search({
  searchParams,
  onSetSearchParams,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState('');
  const [localParams, setLocalParams] = useState<TransactionSearchParams>(searchParams);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local params when searchParams prop changes
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
    }, 500);
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

  return (
    <div className="flex flex-col justify-end items-end">
      <div className="max-w-[200px]">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => updateSearchTerm(e.target.value)}
        />
      </div>
      <div className="mt-2 text-sm text-gray-500 cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '- Hide Advanced Search' : '+ Show Advanced Search'}
      </div>
      {showAdvanced && (
        <div className="mt-2 w-full">
          <form>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5 border-1 border-gray-200 rounded-md p-2">
              <DatePickerInput
                label="Start Date"
                value={localParams.start_date}
                onChange={(date) => updateLocalParam('start_date', date)}
              />
              <DatePickerInput
                label="End Date"
                value={localParams.end_date}
                onChange={(date) => updateLocalParam('end_date', date)}
              />

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
              />
              <div className="flex flex-row items-center pt-5">
                <Checkbox
                  label="Has No Category"
                  checked={localParams.has_no_category}
                  onChange={(e) => updateLocalParam('has_no_category', e.target.checked)}
                />
              </div>

            </div>
          </form>
        </div>
      )}
    </div>
  );
}
