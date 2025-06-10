import { TransactionType } from "@/utils/types";
import { Button, Select } from "@mantine/core";

const transactionTypeOptions: { value: TransactionType, label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

export function TransactionTypeSelect({
  transactionType,
  onSave,
  onCancel,
}: {
  transactionType: TransactionType;
  onSave: (transactionType: TransactionType) => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-row items-center gap-1">
      <Select
        size="xs"
        data={transactionTypeOptions}
        value={transactionType}
        onChange={(value) => onSave(value as TransactionType)}
      />
      <div 
        className="text-xs text-gray-500 ml-3 cursor-pointer hover:bg-gray-300 rounded-full p-2 transition-colors duration-200"
        onClick={onCancel}
      >
        X
      </div>
    </div>
  )
}