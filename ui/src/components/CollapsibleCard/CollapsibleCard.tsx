import { Button, Card } from "@mantine/core";
import { useState } from "react";

type CardState = 'collapsed' | 'expanded';

export function CollapsibleCard({
  children,
  title,
  initialState = 'expanded',
}: {
  children: React.ReactNode;
  title: string;
  initialState: CardState;
}) {
  const [state, setState] = useState<CardState>(initialState);

  return (
    <Card>
      <div className="flex items-center align-middle mb-2">
        <Button
          variant="subtle"
          color="black"
          size="xs"
          title={state === 'expanded' ? 'Collapse' : 'Expand'}
          style={{
            fontSize: '1rem',
          }}
          onClick={() => setState(state === 'expanded' ? 'collapsed' : 'expanded')}
        >
          {state === 'expanded' ? "^" : "v"}
        </Button>
        <h2 className="text-xl font-bold ml-2">{title}</h2>
      </div>
      
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: state === 'expanded' ? '1000px' : '0px',
          opacity: state === 'expanded' ? 1 : 0,
        }}
      >
        {children}
      </div>
    </Card>
  );
}
