import { useState } from "react";
import { Input, Button } from "@mantine/core";

export function Search() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="flex">
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
    </div>
  );
}
