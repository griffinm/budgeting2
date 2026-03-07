import { useState } from "react";
import { Badge, ActionIcon, Popover, TextInput, Button, Group, Text } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { TagReport } from "@/utils/types";

export function SavedTagReports({
  reports,
  activeReportId,
  onSelect,
  onSave,
  onDelete,
  canSave,
}: {
  reports: TagReport[];
  activeReportId: number | null;
  onSelect: (report: TagReport) => void;
  onSave: (name: string) => void;
  onDelete: (id: number) => void;
  canSave: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
    setOpened(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Text size="sm" fw={500} c="dimmed">Reports:</Text>
      {reports.map((report) => (
        <Badge
          key={report.id}
          variant={activeReportId === report.id ? "filled" : "light"}
          size="lg"
          style={{ cursor: "pointer" }}
          onClick={() => onSelect(report)}
          rightSection={
            <ActionIcon
              size="xs"
              variant="transparent"
              color={activeReportId === report.id ? "white" : "gray"}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(report.id);
              }}
            >
              <IconX size={12} />
            </ActionIcon>
          }
        >
          {report.name}
        </Badge>
      ))}
      <Popover opened={opened} onChange={setOpened} position="bottom-start" withArrow>
        <Popover.Target>
          <ActionIcon
            variant="light"
            size="md"
            onClick={() => setOpened((o) => !o)}
            disabled={!canSave}
            title={canSave ? "Save current selection as report" : "Select tags first"}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <div className="flex flex-col gap-2" style={{ minWidth: 200 }}>
            <TextInput
              label="Report name"
              placeholder="e.g. Monthly groceries"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              size="sm"
              autoFocus
            />
            <Group justify="flex-end">
              <Button size="xs" onClick={handleSave} disabled={!name.trim()}>
                Save
              </Button>
            </Group>
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}
