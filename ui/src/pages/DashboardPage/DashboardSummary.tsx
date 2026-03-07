import { Loading } from "@/components/Loading";
import { SimpleGrid } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

function formatDollars(value: number): string {
  const prefix = value < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

interface DashboardSummaryProps {
  availableCash: number;
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
  availableCash,
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
      title: "Available Cash",
      value: availableCash,
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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 dark:from-primary-800 dark:via-primary-700 dark:to-primary-900 p-6">
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)`,
        }}
      />
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={{ base: 'xl', sm: 'md' }} className="relative">
        {cards.map((card, index) => {
          const trendColor = card.diff !== undefined
            ? (card.inverted ? (card.diff >= 0 ? "text-red-300 dark:text-red-300" : "text-emerald-100 dark:text-emerald-300") : (card.diff >= 0 ? "text-emerald-100 dark:text-emerald-300" : "text-red-300 dark:text-red-300"))
            : undefined;

          return (
            <div key={card.title} className={index > 0 ? "sm:border-l sm:border-white/10 sm:pl-4" : ""}>
              <div className="text-white/90 dark:text-primary-200 text-sm font-medium tracking-wide uppercase mb-1">
                {card.title}
              </div>
              <div className="text-white text-3xl font-bold tracking-tight">
                {formatDollars(card.value)}
              </div>
              {card.diff !== undefined && (
                <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
                  {card.diff >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                  {Math.abs(card.diff).toFixed(0)}% vs avg
                </div>
              )}
              {card.subText && (
                <div className="text-primary-100 text-sm mt-1">{card.subText}</div>
              )}
            </div>
          );
        })}
      </SimpleGrid>
    </div>
  );
}
