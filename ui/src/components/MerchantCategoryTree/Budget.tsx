import { MerchantCategory } from "@/utils/types";
import { Progress } from "@mantine/core";
import { Currency } from "../Currency";
import { totalBudgetForChildren } from "@/utils/merchantCategoryUtils";

const formatDollars = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function Budget({
  merchantCategory,
  monthsMultiplier,
}: {
  merchantCategory: MerchantCategory;
  monthsMultiplier: number;
}) {
  const targetBudget = totalBudgetForChildren(merchantCategory) * monthsMultiplier;
  const totalTransactionAmount = merchantCategory.totalTransactionAmount || 0;
  const spentRatio = targetBudget > 0 ? Math.abs(totalTransactionAmount) / targetBudget : 0;
  const isOverBudget = spentRatio > 1;
  const progressValue = Math.min(spentRatio * 100, 100);
  const progressColor = isOverBudget ? 'red' : spentRatio >= 0.85 ? 'yellow' : 'green';

  if (!targetBudget || targetBudget <= 0) {
    return <NoBudget merchantCategory={merchantCategory} />;
  }

  return (
    <div className="relative w-full">
      <Progress.Root size="2xl" radius="lg">
        <Progress.Section
          value={Math.max(progressValue, 1)}
          color={progressColor}
          style={{ padding: '0.25rem' }}
        >
          <Progress.Label>&nbsp;</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-900 dark:text-gray-100">
        {formatDollars(totalTransactionAmount)} / {formatDollars(targetBudget)}
      </div>
    </div>
  );
}

function NoBudget({ merchantCategory }: { merchantCategory: MerchantCategory }) {
  return (
    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
      <Currency
        amount={merchantCategory.totalTransactionAmount || 0}
        applyColor={false}
        showCents={false}
        useBold={true}
      />
      <span className="text-xs text-gray-400 dark:text-gray-500">no budget</span>
    </div>
  );
}
