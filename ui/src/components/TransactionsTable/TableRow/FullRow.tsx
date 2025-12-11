import { MerchantTag, Transaction } from "@/utils/types";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { Link } from "@/components/Link";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { Logo } from "../Logo";
import { PendingBadge } from "./PendingBadge";
import { TransactionNote } from "./TransactionNote";
import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { useState } from "react";

export function FullRow({
  transaction,
  updateTransaction,
  merchantTags,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);

  return (
    <div className="w-full px-3 py-2 relative border-b border-gray-300 hover:bg-gray-100 transition-colors">
      <div className=" flex flex-row">
        <div className="flex flex-col w-1/3">
          <div className="text-md sm:text-lg flex flex-row gap-2 items-center">
            <TransactionAmount amount={transaction.amount} />
            {transaction.pending && <PendingBadge />}
          </div>

          <span className="text-sm text-gray-500">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>

        
        <div className="h-[50px] w-[50px] items-center mr-3 hidden md:flex">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        <div className="flex flex-col w-1/3">
          <div className="text-sm">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <div>
            <TransactionType
              transaction={transaction}
              onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
            />
          </div>
        </div>

        <div className="w-1/3 h-full">
          <CategoryDisplay
            category={transaction.merchantTag}
            onSave={({ id, useDefaultCategory }) => {
              updateTransaction(transaction.id, { merchantTagId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
            }}
            allCategories={merchantTags}
          />
        </div>
        <div className="flex-col items-center justify-center hidden md:flex">
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" size="xs">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setIsEditingNote(true)}>
                Edit Note
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
      <div>
        <TransactionNote
          transaction={transaction}
          updateTransaction={updateTransaction}
          isEditing={isEditingNote}
          onCancel={() => setIsEditingNote(false)}
          onEdit={() => setIsEditingNote(true)}
        />
      </div>
    </div>
  )
}