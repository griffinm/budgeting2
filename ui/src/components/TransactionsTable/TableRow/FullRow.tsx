import { MerchantCategory, Tag, Transaction } from "@/utils/types";
import { TransactionTags } from "@/components/TransactionTags/TransactionTags";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { urls } from "@/utils/urls";
import { Link } from "@/components/Link";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { Logo } from "../Logo";
import { ConfirmTypeButton } from "./ConfirmTypeButton";
import { PendingBadge } from "./PendingBadge";
import { SplitBadge } from "./SplitBadge";
import { TransactionNote } from "./TransactionNote";
import { ActionIcon, Menu } from "@mantine/core";
import { IconChevronDown, IconDotsVertical, IconEye, IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function FullRow({
  transaction,
  updateTransaction,
  merchantCategories,
  allTags,
  addTransactionTag,
  removeTransactionTag,
  createAndAddTag,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  merchantCategories: MerchantCategory[];
  allTags?: Tag[];
  addTransactionTag?: (transactionId: number, tagId: number) => void;
  removeTransactionTag?: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag?: (transactionId: number, name: string) => void;
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="group relative w-full border-b border-gray-100 dark:border-[var(--mantine-color-dark-4)] hover:bg-gray-50 dark:hover:bg-[var(--mantine-color-dark-6)] transition-colors">
      {/* Hover accent rail — echoes the sidebar's active indicator */}
      <span className="pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] bg-primary-400 dark:bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Desktop layout */}
      <div className="hidden md:flex flex-row items-center gap-3 px-4 py-2.5">
        {/* Logo */}
        <div className="h-[40px] w-[40px] flex-shrink-0 flex items-center">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        {/* Merchant + account */}
        <div className="flex flex-col min-w-0 w-[200px] flex-shrink-0">
          <div className="text-sm font-semibold truncate leading-tight">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
          <div className="flex items-center gap-1 mt-1.5">
            <TransactionType
              transaction={transaction}
              onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
            />
            <ConfirmTypeButton transaction={transaction} updateTransaction={updateTransaction} />
          </div>
        </div>

        {/* Category */}
        <div className="min-w-0 w-[180px] flex-shrink-0">
          <CategoryDisplay
            category={transaction.merchantTag}
            onSave={({ id, useDefaultCategory }) => {
              updateTransaction(transaction.id, { merchantCategoryId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
            }}
            allCategories={merchantCategories}
          />
        </div>

        {/* Tags */}
        {allTags && addTransactionTag && removeTransactionTag && createAndAddTag && (
          <div className="flex flex-1 justify-start min-w-0">
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
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto pl-3">
          {transaction.pending && <PendingBadge />}
          {transaction.parentTransactionId && <SplitBadge />}
          <div className="text-right cursor-pointer hover:underline underline-offset-2 decoration-1" onClick={() => navigate(urls.transaction.path(transaction.id))}>
            <TransactionAmount amount={transaction.amount} transactionType={transaction.transactionType} />
          </div>
        </div>

        {/* Menu — rests hidden, reveals on row hover / keyboard focus */}
        <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
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
      <div className="flex md:hidden flex-col justify-between px-4 py-2.5">
        {/* Collapsed: Merchant + Amount */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <IconChevronDown
              size={14}
              className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${isMobileExpanded ? "rotate-0" : "-rotate-90"}`}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate leading-tight">
                <Link to={urls.merchant.path(transaction.merchant.id)} onClick={(e) => e.stopPropagation()}>
                  {merchantDisplayName(transaction.merchant)}
                </Link>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-2 flex-shrink-0 pl-3 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(urls.transaction.path(transaction.id)); }}
          >
            {transaction.pending && <PendingBadge />}
            {transaction.parentTransactionId && <SplitBadge />}
            <TransactionAmount amount={transaction.amount} transactionType={transaction.transactionType} />
          </div>
        </div>

        {/* Expanded: Type + Category + Tags */}
        {isMobileExpanded && (
          <div className="flex items-center flex-wrap w-full mt-2 pt-2 border-t border-gray-100 dark:border-[var(--mantine-color-dark-4)]">
            <div className="w-1/4 flex items-center gap-1">
              <TransactionType
                transaction={transaction}
                onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
              />
              <ConfirmTypeButton transaction={transaction} updateTransaction={updateTransaction} />
            </div>
            <div className="text-center w-1/2 flex justify-center">
              <CategoryDisplay
                category={transaction.merchantTag}
                onSave={({ id, useDefaultCategory }) => {
                  updateTransaction(transaction.id, { merchantCategoryId: id, useAsDefault: useDefaultCategory, merchantId: transaction.merchant.id })
                }}
                allCategories={merchantCategories}
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

      {/* Note row — only rendered when a note exists or is being edited */}
      {(isEditingNote || transaction.note) && (
        <div className="px-4 pb-2.5 -mt-1 md:pl-[3.25rem]">
          <TransactionNote
            transaction={transaction}
            updateTransaction={updateTransaction}
            isEditing={isEditingNote}
            onCancel={() => setIsEditingNote(false)}
            onEdit={() => setIsEditingNote(true)}
          />
        </div>
      )}
    </div>
  )
}