import { Transaction } from "@/utils/types";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { Logo } from "../Logo";
import { Link } from "@/components/Link";
import { urls } from "@/utils/urls";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { TransactionUpdateParams } from "@/api/transaction-client";

export function CondensedRow({
  transaction,
  updateTransaction,
}: {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}) {
  return (
    <div className="w-full relative border-b border-gray-300 hover:bg-gray-100 transition-colors">
      <div className="px-3 py-2 flex flex-row items-center gap-3">
        {/* Logo */}
        <div className="h-[30px] w-[30px] flex-shrink-0 hidden md:flex items-center">
          <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
        </div>

        {/* Merchant + account */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            <Link to={urls.merchant.path(transaction.merchant.id)}>
              {merchantDisplayName(transaction.merchant)}
            </Link>
          </div>
          <span className="text-xs text-gray-400 truncate">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>

        {/* Type badge */}
        <div className="flex-shrink-0">
          <TransactionType
            transaction={transaction}
            onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
          />
        </div>

        {/* Amount — right-aligned */}
        <div className="flex-shrink-0 ml-auto text-right">
          <TransactionAmount amount={transaction.amount} />
        </div>
      </div>
    </div>
  );
}