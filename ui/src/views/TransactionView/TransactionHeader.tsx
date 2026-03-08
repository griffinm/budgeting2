import { Merchant, Transaction } from "@/utils/types";
import { Link } from "react-router-dom";
import { Logo } from "@/components/TransactionsTable/Logo";
import { urls } from "@/utils/urls";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { format } from "date-fns";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";

interface TransactionHeaderProps {
  transaction: Transaction;
  merchant: Merchant;
}

export function TransactionHeader({ 
  transaction,
  merchant,
}: TransactionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-[48px] w-[48px] flex-shrink-0">
        <Logo merchant={merchant} isCheck={transaction.isCheck} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">
            <Link to={urls.merchant.path(merchant.id)}>
            {merchantDisplayName(merchant)}
            </Link>
        </h1>
        <span className="text-sm text-gray-500">
          {format(new Date(transaction.date), "EEEE, MMMM d, yyyy")}
        </span>
      </div>
      
      <div className="ml-auto">
        <div className="text-3xl">
          <TransactionAmount amount={transaction.amount} />
        </div>
      </div>
    </div>
  );
}