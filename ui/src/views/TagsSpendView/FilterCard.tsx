import { Card } from "@mantine/core";
import { Tag, TagReport } from "@/utils/types";
import { MonthsBackSelect } from "@/components/MonthsBackSelect/MonthsBackSelect";
import { SavedTagReports } from "./SavedTagReports";
import { TagSelector } from "./TagSelector";

export function FilterCard({
  tags,
  includedTagIds,
  omittedTagIds,
  onIncludeChange,
  onOmitChange,
  monthsBack,
  onMonthsBackChange,
  tagReports,
  activeReportId,
  onSelectReport,
  onSaveReport,
  onDeleteReport,
  canSave,
}: {
  tags: Tag[];
  includedTagIds: number[];
  omittedTagIds: number[];
  onIncludeChange: (ids: number[]) => void;
  onOmitChange: (ids: number[]) => void;
  monthsBack: number;
  onMonthsBackChange: (value: number) => void;
  tagReports: TagReport[];
  activeReportId: number | null;
  onSelectReport: (report: TagReport) => void;
  onSaveReport: (name: string) => void;
  onDeleteReport: (id: number) => void;
  canSave: boolean;
}) {
  return (
    <Card shadow="sm" radius="md" withBorder p="lg">
      <div className="flex flex-col gap-4">
        <SavedTagReports
          reports={tagReports}
          activeReportId={activeReportId}
          onSelect={onSelectReport}
          onSave={onSaveReport}
          onDelete={onDeleteReport}
          canSave={canSave}
        />
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <TagSelector
              tags={tags}
              includedTagIds={includedTagIds}
              omittedTagIds={omittedTagIds}
              onIncludeChange={onIncludeChange}
              onOmitChange={onOmitChange}
            />
          </div>
          <MonthsBackSelect value={monthsBack} onChange={onMonthsBackChange} />
        </div>
      </div>
    </Card>
  );
}
