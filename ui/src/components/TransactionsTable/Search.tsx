import { useRef, useState } from "react";
import { Input } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";

export function Search({
  searchParams,
  onSetSearchParams,
}: {
  searchParams: TransactionSearchParams;
  onSetSearchParams: (searchParams: TransactionSearchParams) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSearchTerm = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onSetSearchParams({ ...searchParams, search_term: value });
    }, 250);
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
        <div className="mt-2">
          Advanced Search
        </div>
      )}
    </div>
  );
}
