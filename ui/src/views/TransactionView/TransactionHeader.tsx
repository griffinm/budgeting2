import { Merchant, Tag, Transaction } from "@/utils/types";
import { Link } from "react-router-dom";
import { Logo } from "@/components/TransactionsTable/Logo";
import { urls } from "@/utils/urls";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { format } from "date-fns";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { MerchantHoverCard } from "./MerchantHoverCard";

interface TransactionHeaderProps {
  transaction: Transaction;
  merchant: Merchant;
  allTags: Tag[];
  onMerchantUpdated: (merchant: Merchant) => void;
  onTagCreated: (tag: Tag) => void;
}

export function TransactionHeader({
  transaction,
  merchant,
  allTags,
  onMerchantUpdated,
  onTagCreated,
}: TransactionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <MerchantHoverCard
        merchant={merchant}
        allTags={allTags}
        onMerchantUpdated={onMerchantUpdated}
        onTagCreated={onTagCreated}
      >
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
      </MerchantHoverCard>

      <div className="ml-auto">
        <div className="text-3xl">
          <TransactionAmount amount={transaction.amount} />
        </div>
      </div>
    </div>
  );
}
