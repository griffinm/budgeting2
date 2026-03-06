import { MultiSelect, Box } from "@mantine/core";
import { Tag } from "@/utils/types";

export function TagSelector({
  tags,
  selectedTagIds,
  onChange,
}: {
  tags: Tag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}) {
  const data = tags.map((tag) => ({
    value: tag.id.toString(),
    label: tag.name,
  }));

  return (
    <MultiSelect
      data={data}
      value={selectedTagIds.map(String)}
      onChange={(values) => onChange(values.map(Number))}
      placeholder="Select tags to compare..."
      searchable
      clearable
      renderOption={({ option }) => {
        const tag = tags.find((t) => t.id.toString() === option.value);
        return (
          <div className="flex items-center gap-2">
            <Box
              style={{ backgroundColor: tag ? `#${tag.color}` : '#ccc' }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
            />
            <span>{option.label}</span>
          </div>
        );
      }}
    />
  );
}
