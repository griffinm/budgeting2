import { Transaction, TransactionType } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { MonthlyLineChart } from "./MonthlyLineChart";

export function MonthlySpend({
  currentMonthExpenses,
  currentMonthIncome,
  previousMonthExpenses,
  previousMonthIncome,
  loading,
  averageExpense,
  averageIncome,
  expenseMonthsBack,
  incomeMonthsBack,
  setMonthsBack,
}: {
  currentMonthExpenses: Transaction[];
  currentMonthIncome: Transaction[];
  previousMonthExpenses: Transaction[];
  previousMonthIncome: Transaction[];
  loading: boolean;
  averageExpense: number;
  averageIncome: number;
  expenseMonthsBack: number;
  incomeMonthsBack: number;
  setMonthsBack: ({ monthsBack, transactionType }: { monthsBack: number, transactionType: TransactionType }) => void;
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
        average={averageExpense}
        monthsBack={expenseMonthsBack}
        onChangeMonthsBack={(value) => setMonthsBack({ monthsBack: value, transactionType: 'expense' })}
      />
      <MonthlyLineChart
        title="Income MoM"
        currentMonthTransactions={currentMonthIncome}
        previousMonthTransactions={previousMonthIncome}
        transactionType="income"
        average={averageIncome}
        monthsBack={incomeMonthsBack}
        onChangeMonthsBack={(value) => setMonthsBack({ monthsBack: value, transactionType: 'income' })}
      />
    </div>
  );
}
