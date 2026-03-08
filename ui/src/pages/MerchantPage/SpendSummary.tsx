import { Loading } from "@/components/Loading";
import { MerchantSpendStats } from "@/utils/types";
import { Paper, SimpleGrid, Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useMemo } from "react";

function formatDollars(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function SpendSummary({
  spendStats,
  loading,
}: {
  spendStats: MerchantSpendStats | null;
  loading: boolean;
}) {
  const cards = useMemo(() => {
    if (!spendStats) return [];

    const monthly = spendStats.monthlySpend;
    const sumLast = (n: number) =>
      monthly.slice(-n).reduce((acc, m) => acc + m.amount, 0);

    const thisMonth = monthly.length >= 1 ? monthly[monthly.length - 1].amount : 0;
    const prevMonth = monthly.length >= 2 ? monthly[monthly.length - 2].amount : 0;
    const diff = prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth) * 100 : undefined;

    return [
      { title: "This Month", value: thisMonth, diff },
      { title: "Last 3 Months", value: sumLast(3) },
      { title: "Last 6 Months", value: sumLast(6) },
      { title: "All Time", value: Math.abs(spendStats.allTimeSpend) },
    ];
  }, [spendStats]);

  if (loading || !spendStats) {
    return <Loading fullHeight={false} />;
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {cards.map((card) => (
        <Paper withBorder p="md" radius="md" key={card.title}>
          <Text size="sm" c="dimmed">{card.title}</Text>
          <Text size="xxl" fw={700} mt={4} style={{ fontSize: '1.75rem' }}>{formatDollars(card.value)}</Text>
          {card.diff !== undefined && (
            <Text size="xs" mt={4} c={card.diff >= 0 ? "red" : "teal"} className="flex items-center gap-1">
              {card.diff >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
              {Math.abs(card.diff).toFixed(0)}% vs last month
            </Text>
          )}
        </Paper>
      ))}
    </SimpleGrid>
  );
}
