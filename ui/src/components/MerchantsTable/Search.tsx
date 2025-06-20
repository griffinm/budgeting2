import { MerchantSearchParams } from "@/api";
import { TextInput } from "@mantine/core";
import { useRef, useState } from "react";
import { DatePicker } from '@mantine/dates';

export function Search({
  searchParams,
  onSetSearchParams,
}: {
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
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
      onSetSearchParams({ ...searchParams, searchTerm: value });
    }, 250);
  }

  return (
    <div className="flex flex-col justify-end items-end">
      <div className="max-w-[200px]">
      <TextInput
        placeholder="Search"
        value={search}
          onChange={(event) => updateSearchTerm(event.target.value)}
        />
      </div>
      <div className="mt-2 text-sm text-gray-500 cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '- Hide Advanced Search' : '+ Show Advanced Search'}
      </div>
      {showAdvanced && (
        <div className="mt-2">
          <form>

          </form>
        </div>
      )}
    </div>
  )
}