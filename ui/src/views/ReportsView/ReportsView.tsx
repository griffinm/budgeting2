import { useEffect, useState } from "react";
import { Paper } from "@mantine/core";
import { getProfitAndLoss } from "@/api";
import { ProfitAndLoss } from "@/pages/DashboardPage/ProfitAndLoss";
import { useProfitAndLoss } from "@/hooks/useProfitAndLoss";
import { ProfitAndLossItem } from "@/utils/types";
import { FETCH_MONTHS_BACK, SixMonthMovingAverage } from "./SixMonthMovingAverage";

export function ReportsView() {
  // One fetch feeds both moving-average charts
  const [items, setItems] = useState<ProfitAndLossItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProfitAndLoss({ monthsBack: FETCH_MONTHS_BACK }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const { profitAndLoss, profitAndLossLoading, monthsBack, setMonthsBack } = useProfitAndLoss();

  return (
    <div className="flex flex-col gap-4">
      <h1>Reports</h1>
      <SixMonthMovingAverage transactionType="expense" items={items} loading={loading} />
      <SixMonthMovingAverage transactionType="income" items={items} loading={loading} />
      <Paper p="md" withBorder>
        <ProfitAndLoss
          profitAndLoss={profitAndLoss}
          monthsBack={monthsBack}
          setMonthsBack={setMonthsBack}
          loading={profitAndLossLoading}
        />
      </Paper>
    </div>
  );
}
