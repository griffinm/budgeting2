import { useState } from "react";
import { Select, SegmentedControl } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import "@mantine/dates/styles.css";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

const quickOptions = [
  { value: "this", label: "This Month" },
  { value: "last", label: "Last Month" },
  { value: "3", label: "Last 3 Months" },
  { value: "6", label: "Last 6 Months" },
  { value: "12", label: "Last 12 Months" },
  { value: "custom", label: "Custom" },
];

export function rangeForOption(option: string): DateRange | null {
  const now = new Date();
  switch (option) {
    case "this":
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case "last": {
      const lastMonth = subMonths(now, 1);
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
    }
    case "3":
    case "6":
    case "12":
      // Trailing N calendar months, including the current one
      return {
        startDate: startOfMonth(subMonths(now, Number(option) - 1)),
        endDate: endOfMonth(now),
      };
    default:
      return null;
  }
}

export function DateRangeControl({ onChange }: { onChange: (range: DateRange) => void }) {
  const [selectedOption, setSelectedOption] = useState("this");
  const [customStart, setCustomStart] = useState<Date | null>(startOfMonth(new Date()));
  const [customEnd, setCustomEnd] = useState<Date | null>(endOfMonth(new Date()));

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    const range = rangeForOption(value);
    if (range) {
      onChange(range);
    } else if (customStart && customEnd) {
      onChange({ startDate: customStart, endDate: customEnd });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="hidden sm:block">
        <SegmentedControl
          size="sm"
          value={selectedOption}
          onChange={handleOptionChange}
          data={quickOptions}
        />
      </div>
      <div className="sm:hidden">
        <Select
          size="sm"
          value={selectedOption}
          onChange={(value) => value && handleOptionChange(value)}
          data={quickOptions}
        />
      </div>
      {selectedOption === "custom" && (
        <div className="flex gap-2 items-center">
          <DateInput
            size="sm"
            value={customStart}
            onChange={(date) => {
              const parsed = date ? new Date(date) : null;
              setCustomStart(parsed);
              if (parsed && customEnd) {
                onChange({ startDate: parsed, endDate: customEnd });
              }
            }}
            placeholder="Start date"
          />
          <span className="text-gray-400">—</span>
          <DateInput
            size="sm"
            value={customEnd}
            onChange={(date) => {
              const parsed = date ? new Date(date) : null;
              setCustomEnd(parsed);
              if (customStart && parsed) {
                onChange({ startDate: customStart, endDate: parsed });
              }
            }}
            placeholder="End date"
          />
        </div>
      )}
    </div>
  );
}
