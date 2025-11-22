import { MerchantTag } from "@/utils/types";
import { Progress, TagsInput, TypographyStylesProvider } from "@mantine/core";

export function Budget({
  merchantTag,
}: {
  merchantTag: MerchantTag;
}) {
  const targetBudget = merchantTag.targetBudget || 0;
  const totalTransactionAmount = merchantTag.totalTransactionAmount || 0;
  const remainingBudget = targetBudget - totalTransactionAmount;
  const isOverBudget = remainingBudget < 0;
  let progressValue = Math.abs(totalTransactionAmount) / targetBudget * 100;
  let progressColor = isOverBudget ? 'red' : 'green';
  
  if (!targetBudget) {
    progressValue = 100;
    progressColor = 'gray';
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
