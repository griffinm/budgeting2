import { useState } from "react";
import { Transaction, TransactionType } from "../../utils/types";
import { 
  Badge,
} from "@mantine/core";
import { TransactionTypeSelect } from "./TransactionTypeSelect";

export function CategoryDisplay({
  transaction,
  onSave,
}: {
  transaction: Transaction;
  onSave: (id: number, transactionType: TransactionType) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (transactionType: TransactionType) => {
    onSave(transaction.id, transactionType);
    setIsEditing(false);
  }

  const renderDisplayMode = () => {
    const badgeColor = (() => {
      switch(transaction.transactionType) {
        case 'expense':
          return 'blue';
        case 'income':
          return 'green';
        case 'transfer':
          return 'gray';
        default:
          return 'gray';
      }
    })();
    const badgeText = (() => {
      switch(transaction.transactionType) {
        case 'expense':
          return 'Expense';
        case 'income':
          return 'Income';
        case 'transfer':
          return 'Transfer';
        default:
          return 'Unknown';
      }
    })();

    return (
      <Badge color={badgeColor} variant="light" onClick={() => setIsEditing(true)}>
        {badgeText}
      </Badge>
    )
  }

  const renderEditMode = () => {
    return (
      <div>
        <TransactionTypeSelect
          onCancel={() => setIsEditing(false)}
          transactionType={transaction.transactionType}
          onSave={handleSave}
        />
      </div>
    )
  }

  return (
    <div>
      {isEditing ? renderEditMode() : renderDisplayMode()}
    </div>
  )
}