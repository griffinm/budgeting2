import { Transaction } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { MonthlyLineChart } from "./MonthlyLineChart";

export function MonthlySpend({
  currentMonthExpenses,
  currentMonthIncome,
  previousMonthExpenses,
  previousMonthIncome,
  loading,
}: {
  currentMonthExpenses: Transaction[];
  currentMonthIncome: Transaction[];
  previousMonthExpenses: Transaction[];
  previousMonthIncome: Transaction[];
  loading: boolean;
}) {

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <MonthlyLineChart
        title="Expenses MoM"
        currentMonthTransactions={currentMonthExpenses}
        previousMonthTransactions={previousMonthExpenses}
        transactionType="expense"
      />
      <MonthlyLineChart
        title="Income MoM"
        currentMonthTransactions={currentMonthIncome}
        previousMonthTransactions={previousMonthIncome}
        transactionType="income"
      />
    </div>
  );
}
