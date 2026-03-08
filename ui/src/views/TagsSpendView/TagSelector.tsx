import { MultiSelect, Box } from "@mantine/core";
import { Tag } from "@/utils/types";

export function TagSelector({
  tags,
  includedTagIds,
  omittedTagIds,
  onIncludeChange,
  onOmitChange,
}: {
  tags: Tag[];
  includedTagIds: number[];
  omittedTagIds: number[];
  onIncludeChange: (tagIds: number[]) => void;
  onOmitChange: (tagIds: number[]) => void;
}) {
  const omittedSet = new Set(omittedTagIds.map(String));
  const includedSet = new Set(includedTagIds.map(String));

  const includeData = tags
    .filter((tag) => !omittedSet.has(tag.id.toString()))
    .map((tag) => ({ value: tag.id.toString(), label: tag.name }));

  const omitData = tags
    .filter((tag) => !includedSet.has(tag.id.toString()))
    .map((tag) => ({ value: tag.id.toString(), label: tag.name }));

  const renderOption = ({ option }: { option: { value: string; label: string } }) => {
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
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1">
        <MultiSelect
          label="Include tags"
          data={includeData}
          value={includedTagIds.map(String)}
          onChange={(values) => onIncludeChange(values.map(Number))}
          placeholder="Select tags to include..."
          searchable
          clearable
          renderOption={renderOption}
        />
      </div>
      <div className="flex-1">
        <MultiSelect
          label="Omit tags"
          data={omitData}
          value={omittedTagIds.map(String)}
          onChange={(values) => onOmitChange(values.map(Number))}
          placeholder="Select tags to omit..."
          searchable
          clearable
          renderOption={renderOption}
        />
      </div>
    </div>
  );
}
