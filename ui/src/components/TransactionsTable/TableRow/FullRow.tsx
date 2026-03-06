import { MerchantTag, Tag, Transaction } from "@/utils/types";
import { TransactionTags } from "@/components/TransactionTags/TransactionTags";
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
  allTags,
  addTransactionTag,
  removeTransactionTag,
  createAndAddTag,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantTags: MerchantTag[];
  allTags: Tag[];
  addTransactionTag: (transactionId: number, tagId: number) => void;
  removeTransactionTag: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag: (transactionId: number, name: string) => void;
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);

  return (
    <div className="w-full px-3 py-2 relative border-b border-gray-300 hover:bg-gray-100 transition-colors">
      <div className="flex flex-row items-center gap-3">
        {/* Logo */}
        <div className="h-[40px] w-[40px] flex-shrink-0 hidden md:flex items-center">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        {/* Merchant + account */}
        <div className="flex flex-col min-w-0 w-[200px] flex-shrink-0">
          <div className="text-sm font-medium truncate">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 truncate">
              {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
            </span>
            <TransactionType
              transaction={transaction}
              onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="min-w-0 w-[180px] flex-shrink-0">
          <CategoryDisplay
            category={transaction.merchantTag}
            onSave={({ id, useDefaultCategory }) => {
              updateTransaction(transaction.id, { merchantTagId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
            }}
            allCategories={merchantTags}
          />
        </div>

        {/* Tags */}
        <div className="min-w-0 flex-1">
          <TransactionTags
            transaction={transaction}
            allTags={allTags}
            onAdd={addTransactionTag}
            onRemove={removeTransactionTag}
            onCreateAndAdd={createAndAddTag}
          />
        </div>

        {/* Amount — right-aligned */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-3">
          {transaction.pending && <PendingBadge />}
          <div className="text-right">
            <TransactionAmount amount={transaction.amount} />
          </div>
        </div>

        {/* Menu */}
        <div className="flex-shrink-0 hidden md:flex items-center">
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

      {/* Note row */}
      <TransactionNote
        transaction={transaction}
        updateTransaction={updateTransaction}
        isEditing={isEditingNote}
        onCancel={() => setIsEditingNote(false)}
        onEdit={() => setIsEditingNote(true)}
      />
    </div>
  )
}