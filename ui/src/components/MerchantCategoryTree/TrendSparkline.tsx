import { Sparkline } from "@mantine/charts";
import { Tooltip } from "@mantine/core";
import { subMonths } from "date-fns";
import { MerchantCategorySpendStats } from "@/utils/types";
import { SPARKLINE_MONTHS } from "@/hooks/useCategorySpendData";

export function buildSparklineData(stats?: MerchantCategorySpendStats[]): number[] {
  const now = new Date();
  return Array.from({ length: SPARKLINE_MONTHS }, (_, i) => {
    const monthDate = subMonths(now, SPARKLINE_MONTHS - 1 - i);
    const stat = stats?.find(
      (s) => s.month === monthDate.getMonth() + 1 && s.year === monthDate.getFullYear(),
    );
    return stat?.totalAmount || 0;
  });
}

export function TrendSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.every((value) => value === 0)) {
    return null;
  }

  return (
    <Tooltip label={`Monthly spend, last ${SPARKLINE_MONTHS} months`} withArrow>
      <div className="shrink-0">
        <Sparkline
          w={110}
          h={28}
          data={data}
          color={color}
          curveType="monotone"
          fillOpacity={0.25}
          strokeWidth={1.5}
        />
      </div>
    </Tooltip>
  );
}
