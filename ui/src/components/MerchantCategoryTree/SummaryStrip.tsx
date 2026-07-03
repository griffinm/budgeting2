import { Paper, SimpleGrid } from "@mantine/core";
import classNames from "classnames";
import { MerchantCategory } from "@/utils/types";
import { totalBudgetForChildren } from "@/utils/merchantCategoryUtils";

function formatDollars(value: number): string {
  const prefix = value < 0 ? "-$" : "$";
  return `${prefix}${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function SummaryStrip({
  tree,
  uncategorizedTotal,
  monthsInRange,
}: {
  tree: MerchantCategory[];
  uncategorizedTotal: number;
  monthsInRange: number;
}) {
  const totalBudget = tree.reduce(
    (acc, category) => acc + totalBudgetForChildren(category) * monthsInRange,
    0,
  );
  const categorizedSpend = tree.reduce(
    (acc, category) => acc + (category.totalTransactionAmount || 0),
    0,
  );
  const totalSpent = categorizedSpend + uncategorizedTotal;
  const remaining = totalBudget - totalSpent;
  const overBudgetCount = tree.filter((category) => {
    const budget = totalBudgetForChildren(category) * monthsInRange;
    return budget > 0 && (category.totalTransactionAmount || 0) > budget;
  }).length;

  const tiles = [
    { label: "Budgeted", value: formatDollars(totalBudget) },
    { label: "Spent", value: formatDollars(totalSpent) },
    {
      label: remaining < 0 ? "Over" : "Remaining",
      value: formatDollars(Math.abs(remaining)),
      className: remaining < 0 ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-400",
    },
    {
      label: "Over Budget",
      value: String(overBudgetCount),
      sub: overBudgetCount === 1 ? "category" : "categories",
      className: overBudgetCount > 0 ? "text-red-600 dark:text-red-400" : undefined,
    },
  ];

  return (
    <Paper p="md" radius="md" withBorder shadow="sm">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={{ base: "lg", sm: "md" }}>
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={classNames({
              "sm:border-l sm:border-gray-200 sm:dark:border-[var(--mantine-color-dark-4)] sm:pl-4":
                index > 0,
            })}
          >
            <div className="text-xs font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1">
              {tile.label}
            </div>
            <div
              className={classNames(
                "text-2xl font-bold tracking-tight",
                tile.className,
              )}
            >
              {tile.value}
              {tile.sub && (
                <span className="ml-1.5 text-sm font-normal text-gray-400 dark:text-gray-500">
                  {tile.sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
