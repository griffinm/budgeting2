import { Loading } from "@/components/Loading";
import { Paper, SimpleGrid, Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

function formatDollars(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

interface DashboardSummaryProps {
  netWorth: number;
  expensesThisMonth: number;
  incomeThisMonth: number;
  profitThisMonth: number;
  expenseChange?: number;
  incomeChange?: number;
  profitChange?: number;
  expenseAvgByToday?: number;
  incomeAvgByToday?: number;
  loading: boolean;
}

export function DashboardSummary({
  netWorth,
  expensesThisMonth,
  incomeThisMonth,
  profitThisMonth,
  expenseChange,
  incomeChange,
  profitChange,
  expenseAvgByToday,
  incomeAvgByToday,
  loading,
}: DashboardSummaryProps) {
  if (loading) {
    return <Loading fullHeight={false} />;
  }

  const cards = [
    {
      title: "Net Worth",
      value: netWorth,
    },
    {
      title: "Expenses This Month",
      value: expensesThisMonth,
      diff: expenseChange,
      inverted: true,
      subText: expenseAvgByToday !== undefined ? `Avg by today: ${formatDollars(expenseAvgByToday)}` : undefined,
    },
    {
      title: "Income This Month",
      value: incomeThisMonth,
      diff: incomeChange,
      inverted: false,
      subText: incomeAvgByToday !== undefined ? `Avg by today: ${formatDollars(incomeAvgByToday)}` : undefined,
    },
    {
      title: "Profit This Month",
      value: profitThisMonth,
      diff: profitChange,
      inverted: false,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {cards.map((card) => {
        const trendColor = card.diff !== undefined
          ? (card.inverted ? (card.diff >= 0 ? "red" : "teal") : (card.diff >= 0 ? "teal" : "red"))
          : undefined;

        return (
          <Paper withBorder p="md" radius="md" key={card.title}>
            <Text size="sm" c="dimmed">{card.title}</Text>
            <Text size="xxl" fw={700} mt={4} style={{ fontSize: '1.75rem' }}>{formatDollars(card.value)}</Text>
            {card.diff !== undefined && (
              <Text size="xs" mt={4} c={trendColor} className="flex items-center gap-1">
                {card.diff >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                {Math.abs(card.diff).toFixed(0)}% vs avg
              </Text>
            )}
            {card.subText && (
              <Text size="xs" c="dimmed" mt={2}>{card.subText}</Text>
            )}
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
