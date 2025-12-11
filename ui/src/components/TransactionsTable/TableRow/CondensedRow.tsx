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
    <div className="w-full relative border-b border-gray-300 pt-2 hover:bg-gray-100 transition-colors">
      <div className="px-2 py-1 flex flex-row">
        <div className="flex flex-col w-1/3">
          <span className="text-sm">
            <TransactionAmount amount={transaction.amount} />
          </span>

          <span className="text-sm text-gray-500">
            {transaction.plaidAccount.nickname || transaction.plaidAccount.plaidOfficialName}
          </span>
        </div>

        <div className="flex flex-row w-1/3 gap-2 items-center pb-2">
          <div className="h-[30px] w-[30px] items-center mr-3 hidden md:flex">
            <Logo merchant={transaction.merchant} isCheck={transaction.isCheck} />
          </div>

          <div className="flex flex-col">
            <div className="text-sm">
              <Link to={urls.merchant.path(transaction.merchant.id)}>
                {merchantDisplayName(transaction.merchant)}
              </Link>
            </div>

          </div>
        </div>

        <div className="flex flex-col w-1/3 items-center">
          <TransactionType
            transaction={transaction}
            onSave={(id, transactionType) => updateTransaction(id, { transactionType, useAsDefault: false, merchantId: transaction.merchant.id })}
          />
        </div>
      </div>
    </div>
  );
}