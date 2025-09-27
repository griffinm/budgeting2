import { MerchantSearchParams } from "@/api";
import { TextInput, Select } from "@mantine/core";
import { useRef, useState } from "react";
import { MerchantGroup } from "@/utils/types";

export function Search({
  searchParams,
  onSetSearchParams,
  allMerchantGroups,
}: {
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  allMerchantGroups: MerchantGroup[];
}) {
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

  const updateMerchantGroupFilter = (value: string | null) => {
    onSetSearchParams({ 
      ...searchParams, 
      merchantGroupId: value ? Number(value) : undefined 
    });
  }

  return (
    <div className="flex flex-col justify-end items-end">
      <div className="flex gap-2">
        <div className="max-w-[200px]">
          <TextInput
            placeholder="Search"
            value={search}
            onChange={(event) => updateSearchTerm(event.target.value)}
          />
        </div>
        <div className="max-w-[200px]">
          <Select
            placeholder="Filter by group"
            value={searchParams.merchantGroupId?.toString() || null}
            onChange={updateMerchantGroupFilter}
            data={[
              { value: '', label: 'All Groups' },
              ...allMerchantGroups.map(group => ({
                value: group.id.toString(),
                label: group.name
              }))
            ]}
            clearable
            searchable
          />
        </div>
      </div>
    </div>
  )
}