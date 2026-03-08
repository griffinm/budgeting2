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
import { IconChevronDown, IconDotsVertical, IconEye, IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  allTags?: Tag[];
  addTransactionTag?: (transactionId: number, tagId: number) => void;
  removeTransactionTag?: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag?: (transactionId: number, name: string) => void;
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full px-3 py-2 relative border-b border-gray-300 hover:bg-gray-100 transition-colors">
      {/* Desktop layout */}
      <div className="hidden md:flex flex-row items-center gap-3">
        {/* Logo */}
        <div className="h-[40px] w-[40px] flex-shrink-0 flex items-center">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        {/* Merchant + account */}
        <div className="flex flex-col min-w-0 w-[200px] flex-shrink-0">
          <div className="text-sm font-medium truncate">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <div className="flex flex-col gap-2 pt-1">
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
        {allTags && addTransactionTag && removeTransactionTag && createAndAddTag && (
          <div className="flex flex-1 justify-center">
            <TransactionTags
              transaction={transaction}
              allTags={allTags}
              onAdd={addTransactionTag}
              onRemove={removeTransactionTag}
              onCreateAndAdd={createAndAddTag}
            />
          </div>
        )}

        {/* Amount — right-aligned */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-3">
          {transaction.pending && <PendingBadge />}
          <div className="text-right cursor-pointer hover:underline" onClick={() => navigate(urls.transaction.path(transaction.id))}>
            <TransactionAmount amount={transaction.amount} />
          </div>
        </div>

        {/* Menu */}
        <div className="flex-shrink-0 flex items-center">
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" size="xs">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={16} />} onClick={() => navigate(urls.transaction.path(transaction.id))}>
                View Details
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setIsEditingNote(true)}>
                Edit Note
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden flex-col justify-between">
        {/* Collapsed: Merchant + Amount */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <IconChevronDown
              size={14}
              className={`flex-shrink-0 text-gray-400 transition-transform ${isMobileExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                <Link to={urls.merchant.path(transaction.merchant.id)} onClick={(e) => e.stopPropagation()}>
                  {merchantDisplayName(transaction.merchant)}
                </Link>
              </div>
              <span className="text-xs text-gray-400">
                {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 flex-shrink-0 pl-3 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(urls.transaction.path(transaction.id)); }}
          >
            {transaction.pending && <PendingBadge />}
            <TransactionAmount amount={transaction.amount} />
          </div>
        </div>

        {/* Expanded: Type + Category + Tags */}
        {isMobileExpanded && (
          <div className="flex items-center flex-wrap w-full">
            <div className="w-1/4">
              <TransactionType
                transaction={transaction}
                onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
              />
            </div>
            <div className="text-center w-1/2 flex justify-center">
              <CategoryDisplay
                category={transaction.merchantTag}
                onSave={({ id, useDefaultCategory }) => {
                  updateTransaction(transaction.id, { merchantTagId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
                }}
                allCategories={merchantTags}
              />
            </div>
            {allTags && addTransactionTag && removeTransactionTag && createAndAddTag && (
              <div className="w-1/4 text-right flex justify-end">
                <TransactionTags
                  transaction={transaction}
                  allTags={allTags}
                  onAdd={addTransactionTag}
                  onRemove={removeTransactionTag}
                  onCreateAndAdd={createAndAddTag}
                />
              </div>
            )}
          </div>
        )}
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