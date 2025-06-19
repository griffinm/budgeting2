import { MerchantSpendStats } from "@/utils/types";

export function currentMonthSpend(merchantSpendStats: MerchantSpendStats) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthSpend = merchantSpendStats.monthlySpend.find(month => month.month === `${currentYear}-${currentMonth.toString().padStart(2, '0')}`);
  return currentMonthSpend?.amount || 0;
}

export function lastMonthSpend(merchantSpendStats: MerchantSpendStats) {
  const lastMonth = new Date().getMonth() - 1;
  const lastYear = new Date().getFullYear();
  const lastMonthSpend = merchantSpendStats.monthlySpend.find(month => month.month === `${lastYear}-${lastMonth.toString().padStart(2, '0')}`);
  return lastMonthSpend?.amount || 0;
}

export function allTimeSpend(merchantSpendStats: MerchantSpendStats) {
  return merchantSpendStats.allTimeSpend;
}