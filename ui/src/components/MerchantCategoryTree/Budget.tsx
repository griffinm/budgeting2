import { MerchantTag } from "@/utils/types";
import { Progress } from "@mantine/core";
import { Currency } from "../Currency";

export function Budget({
  merchantTag,
}: {
  merchantTag: MerchantTag;
}) {
  const targetBudget = merchantTag.targetBudget || 0;
  const totalTransactionAmount = merchantTag.totalTransactionAmount || 0;
  const remainingBudget = targetBudget - totalTransactionAmount;
  const isOverBudget = remainingBudget < 0;
  const progressValue = Math.abs(totalTransactionAmount) / targetBudget * 100;
  const progressColor = isOverBudget ? 'red' : 'green';

  if (!targetBudget) {
    return (
      <div>
        <NoBudget merchantTag={merchantTag} />
      </div>
    )
  }

  const renderLabel = () => {
    if (!targetBudget) {
      return merchantTag.totalTransactionAmount;
    }

    return `${targetBudget} of ${merchantTag.totalTransactionAmount}`;
  }

  return (
    <>
      <Progress.Root size="2xl" radius="lg">
        <Progress.Section value={progressValue} color={progressColor}>
          <Progress.Label className="py-1">
            {renderLabel()}
          </Progress.Label>
        </Progress.Section>
      </Progress.Root>
    </>
  )
}

function NoBudget({
  merchantTag,
}: {
  merchantTag: MerchantTag;
}) {
  return (
    <div>
      <Currency
        amount={merchantTag.totalTransactionAmount || 0}
        applyColor={false}
        showCents={false}
        useBold={true}
      />
    </div>
  )
}
