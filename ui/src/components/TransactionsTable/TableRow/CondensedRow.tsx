import { Transaction } from "@/utils/types";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { Logo } from "../Logo";
import { Link } from "@/components/Link";
import { urls } from "@/utils/urls";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { ConfirmTypeButton } from "./ConfirmTypeButton";
import { SplitBadge } from "./SplitBadge";

export function CondensedRow({
  transaction,
  updateTransaction,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}) {
  return (
    <div className="group w-full relative border-b border-gray-100 dark:border-[var(--mantine-color-dark-4)] hover:bg-gray-50 dark:hover:bg-[var(--mantine-color-dark-6)] transition-colors">
      {/* Hover accent rail — echoes the sidebar's active indicator */}
      <span className="pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] bg-primary-400 dark:bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="px-4 py-2.5 flex flex-row items-center gap-3">
        {/* Logo */}
        <div className="h-[30px] w-[30px] flex-shrink-0 hidden md:flex items-center">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        {/* Merchant + account */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-sm font-semibold truncate leading-tight">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>

        {/* Type badge */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <TransactionType
            transaction={transaction}
            onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
          />
          <ConfirmTypeButton transaction={transaction} updateTransaction={updateTransaction} />
        </div>

        {/* Amount — right-aligned */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {transaction.parentTransactionId && <SplitBadge />}
          <div className="text-right">
            <TransactionAmount amount={transaction.amount} transactionType={transaction.transactionType} />
          </div>
        </div>
      </div>
    </div>
  );
}