import { useState } from "react";
import { Merchant, Transaction } from "../../utils/types";
import { TransactionType as TransactionTypeType } from "@/utils/types";
import { 
  Badge,
} from "@mantine/core";
import { TypeSelector } from "./TypeSelector";

export function TransactionType({
  transaction,
  merchant,
  onSave,
}: {
  transaction?: Transaction;
  merchant?: Merchant;
  onSave: (id: number, transactionType: TransactionTypeType) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);


  if (!transaction && !merchant) {
    throw new Error('TransactionType must be passed either a transaction or a merchant');
  }
  if (transaction && merchant) {
    throw new Error('TransactionType must be passed either a transaction or a merchant, not both');
  }

  const transactionType = transaction?.transactionType || merchant?.defaultTransactionType;
  const id = transaction?.id || merchant?.id;
  
  const handleSave = (transactionType: TransactionTypeType) => {
    onSave(id!, transactionType);
    setIsEditing(false);
  }

  const renderDisplayMode = () => {
    const badgeColor = (() => {
      switch(transactionType) {
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
      switch(transactionType) {
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
        <TypeSelector
          onCancel={() => setIsEditing(false)}
          transactionType={transactionType!}
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
