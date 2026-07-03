import { useEffect, useMemo, useState } from "react";
import { CompositeChart } from "@mantine/charts";
import { Paper, Text } from "@mantine/core";
import { format as formatDate } from "date-fns";
import { getProfitAndLoss } from "@/api";
import { Loading } from "@/components/Loading";
import { chartCurrencyFormatter } from "@/utils/currencyUtils";
import { ProfitAndLossItem } from "@/utils/types";

const DISPLAY_MONTHS = 24;
const MA_WINDOW = 6;
const FETCH_MONTHS_BACK = DISPLAY_MONTHS + MA_WINDOW - 1;

function monthLabel(item: ProfitAndLossItem) {
  return formatDate(new Date(item.year, item.month - 1, 1), "MMM yyyy");
}

const currencyFormatter = chartCurrencyFormatter({ cents: true });

export function SixMonthMovingAverage() {
  const [items, setItems] = useState<ProfitAndLossItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProfitAndLoss({ monthsBack: FETCH_MONTHS_BACK }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const sorted = [...items]
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .filter(
        (item) => !(item.year === currentYear && item.month === currentMonth),
      );

    const enriched = sorted.map((item, i) => {
      let movingAverage: number | undefined;
      if (i >= MA_WINDOW - 1) {
        const window = sorted.slice(i - (MA_WINDOW - 1), i + 1);
        const sum = window.reduce((acc, w) => acc + w.expense, 0);
        movingAverage = Math.round((sum / MA_WINDOW) * 100) / 100;
      }
      return {
        month: monthLabel(item),
        expense: item.expense,
        movingAverage,
      };
    });

    return enriched.slice(-DISPLAY_MONTHS);
  }, [items]);

  return (
    <Paper p="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        6-Month Moving Average
      </Text>
      {loading ? (
        <Loading fullHeight={false} />
      ) : (
        <CompositeChart
          h={350}
          data={chartData}
          dataKey="month"
          series={[
            { name: "expense", color: "red", label: "Monthly Spend", type: "bar" },
            {
              name: "movingAverage",
              color: "blue",
              label: "6-Month Moving Average",
              type: "line",
            },
          ]}
          withLegend
          valueFormatter={currencyFormatter}
        />
      )}
    </Paper>
  );
}
