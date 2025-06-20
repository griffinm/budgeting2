import { Currency } from "@/components/Currency/Currency";
import { Loading } from "@/components/Loading";
import { ProfitAndLossItem } from "@/utils/types";
import { BarChart } from "@mantine/charts";
import { Select, Table } from "@mantine/core";
import { format as formatDate } from 'date-fns';
import { useMemo } from "react";

export function ProfitAndLoss({
  profitAndLoss,
  monthsBack,
  setMonthsBack,
  loading,
}: {
  profitAndLoss: ProfitAndLossItem[];
  monthsBack: number;
  setMonthsBack: (monthsBack: number) => void;
  loading: boolean;
}) {
  const sortedProfitAndLoss = useMemo(() => {
    return profitAndLoss.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [profitAndLoss]);
  const averageExpense = useMemo(() => {
    return sortedProfitAndLoss.reduce((acc, item) => acc + item.expense, 0) / sortedProfitAndLoss.length;
  }, [sortedProfitAndLoss]);
  const averageProfit = useMemo(() => {
    return sortedProfitAndLoss.reduce((acc, item) => acc + item.profit, 0) / sortedProfitAndLoss.length;
  }, [sortedProfitAndLoss]);
  const averageIncome = useMemo(() => {
    return sortedProfitAndLoss.reduce((acc, item) => acc + item.income, 0) / sortedProfitAndLoss.length;
  }, [sortedProfitAndLoss]);

  const renderData = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <BarChart
            title={`Profit and Loss for ${monthsBack} months`}
            h={350}
            data={sortedProfitAndLoss.map((item) => ({
              month: formatDate(new Date(item.date), 'MMM yyyy'),
              expense: item.expense,
              income: item.income,
            }))}
            dataKey="month"
            series={[
              { name: 'expense', color: 'red', label: 'Expense' },
              { name: 'income', color: 'green', label: 'Income' },
            ]}
            withLegend={true}
            
            valueFormatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            referenceLines={[
              {
                y: averageExpense,
                color: 'red',
                strokeWidth: 2,
                strokeDasharray: '3 3',
              },
              {
                y: averageIncome,
                color: 'green',
                strokeWidth: 2,
                strokeDasharray: '3 3',
              },
            ]}
          />
        </div>
        <div className="w-full md:w-1/2">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Expense</Table.Th>
                <Table.Th>Income</Table.Th>
                <Table.Th>Profit</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedProfitAndLoss.map((item) => (
                <Table.Tr key={item.date.toString()}>
                  <Table.Td>{formatDate(new Date(item.date), 'MMM yyyy')}</Table.Td>
                  <Table.Td>
                    <Currency
                      amount={item.expense}
                      applyColor={false}
                      useBold={false}
                      showCents={false}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Currency
                      amount={item.income}
                      applyColor={false}
                      useBold={false}
                      showCents={false}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Currency
                      amount={item.profit}
                      applyColor={true}
                      useBold={true}
                      showCents={false}
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
              <Table.Tr style={{ backgroundColor: '#f2f2f2', borderTop: '2px solid gray' }}>
                <Table.Td>
                  <span className="font-bold">Total</span>
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={sortedProfitAndLoss.reduce((acc, item) => acc + item.expense, 0)}
                    applyColor={false}
                    useBold
                    showCents={false}
                  />
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={sortedProfitAndLoss.reduce((acc, item) => acc + item.income, 0)}
                    applyColor={false}
                    useBold
                    showCents={false}
                  />
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={sortedProfitAndLoss.reduce((acc, item) => acc + item.profit, 0)}
                    applyColor={true}
                    useBold={true}
                    showCents={false}
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>
                  <span className="font-bold">Average</span>
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={averageExpense}
                    applyColor={false}
                    useBold={false}
                    showCents={false}
                  />
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={averageIncome}
                    applyColor={false}
                    useBold={false}
                    showCents={false}
                  />
                </Table.Td>
                <Table.Td>
                  <Currency
                    amount={averageProfit}
                    applyColor={true}
                    useBold={true}
                    showCents={false}
                  />
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-4 flex flex-col gap-4">
      <div className="flex flex-row gap-2 justify-between mb-2">
        <h2 className="text-2xl">
          Profit and Loss
        </h2>
        <Select
          size="xs"
          data={[
            { value: '3', label: 'Show 3 Months' },
            { value: '6', label: 'Show 6 Months' },
            { value: '12', label: 'Show 12 Months' },
            { value: '24', label: 'Show 24 Months' },
          ]}
          value={monthsBack.toString()}
          onChange={(value) => setMonthsBack(parseInt(value || '12'))}
        />
      </div>

      {loading ? <Loading fullHeight={false} /> : renderData()}
    </div>
  )
}