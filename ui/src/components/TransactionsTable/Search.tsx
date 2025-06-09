import { useEffect, useRef, useState } from "react";
import { Input } from "@mantine/core";
import { TransactionSearchParams } from "@/api/transaction-client";

export function Search() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useState<TransactionSearchParams>({});
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log(searchParams);
  }, [searchParams]);

  const updateSearchTerm = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setSearchParams({ ...searchParams, search_term: value });
    }, 250);
  };

  return (
    <div className="flex">
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => updateSearchTerm(e.target.value)}
      />
      
    </div>
  );
}
