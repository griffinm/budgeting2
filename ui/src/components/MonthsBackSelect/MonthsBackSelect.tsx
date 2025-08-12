import { Select } from "@mantine/core";

export function MonthsBackSelect({
  options = [3, 6, 12, 24],
  value,
  onChange,
}: {
  options?: number[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const optionsData = options.map((option) => (
    { 
      label: `${option} months back`, 
      value: option.toString(),
    }
  ));

  return <Select
    value={value.toString()}
    onChange={(value) => onChange(Number(value))}
    data={optionsData}
    size="xs"
  />;
}