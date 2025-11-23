import { MerchantTag } from "@/utils/types";
import { Progress } from "@mantine/core";
import { Currency } from "../Currency";
import { totalBudgetForChildren } from "@/utils/merchantTagUtils";

export function Budget({
  merchantTag,
  monthsBack,
}: {
  merchantTag: MerchantTag;
  monthsBack: number;
}) {
  const targetBudget = totalBudgetForChildren(merchantTag) * monthsBack;
  const totalTransactionAmount = merchantTag.totalTransactionAmount || 0;
  const remainingBudget = targetBudget - totalTransactionAmount;
  const isOverBudget = remainingBudget < 0;
  const progressValue = Math.abs(totalTransactionAmount) / targetBudget * 100;
  const progressColor = isOverBudget ? 'red' : 'green';

  const formattedTargetBudget = new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(targetBudget);
  const formattedTotalTransactionAmount = new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalTransactionAmount);

  if (!targetBudget || targetBudget <= 0) {
    return (
      <div>
        <NoBudget merchantTag={merchantTag} />
      </div>
    )
  }

  const renderLabel = () => {
    if (!targetBudget) {
      return formattedTotalTransactionAmount;
    }

    return `${formattedTotalTransactionAmount} / ${formattedTargetBudget}`;
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Progress.Root size="2xl" radius="lg">
          <Progress.Section value={Math.max(progressValue, 1)} color={progressColor} style={{ padding: '0.25rem' }}>
            <Progress.Label>&nbsp;</Progress.Label>
          </Progress.Section>
        </Progress.Root>
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontWeight: 500,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {renderLabel()}
        </div>
      </div>
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
