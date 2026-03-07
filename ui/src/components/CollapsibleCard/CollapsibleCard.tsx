import { Collapse, Paper, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

type CardState = 'collapsed' | 'expanded';

export function CollapsibleCard({
  children,
  title,
  initialState = 'expanded',
  rightSection,
}: {
  children: React.ReactNode;
  title: string;
  initialState: CardState;
  rightSection?: React.ReactNode;
}) {
  const [state, setState] = useState<CardState>(initialState);
  const expanded = state === 'expanded';

  return (
    <Paper withBorder p="md" radius="md">
      <UnstyledButton
        onClick={() => setState(expanded ? 'collapsed' : 'expanded')}
        className="flex items-center gap-2 w-full"
      >
        <IconChevronRight
          size={20}
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
        <span className="text-xl font-bold">{title}</span>
        {rightSection && <div className="ml-auto">{rightSection}</div>}
      </UnstyledButton>

      <Collapse in={expanded}>
        <div className="mt-3">
          {children}
        </div>
      </Collapse>
    </Paper>
  );
}
