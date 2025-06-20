import { useState, useEffect } from 'react';
import { getProfitAndLoss } from '@/api';
import { ProfitAndLossItem } from '@/utils/types';

export function useProfitAndLoss() {
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLossItem[]>([]);
  const [profitAndLossLoading, setProfitAndLossLoading] = useState(false);
  const [monthsBack, setMonthsBack] = useState(12);

  useEffect(() => {
    setProfitAndLossLoading(true);
    getProfitAndLoss({ monthsBack }).then((data) => {
      setProfitAndLoss(data);
      setProfitAndLossLoading(false);
    });
  }, [monthsBack]);

  return { profitAndLoss, profitAndLossLoading, monthsBack, setMonthsBack };
}