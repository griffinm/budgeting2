import { AccountBalance as AccountBalanceType, AccountType } from "@/utils/types";
import { useState } from "react";
import { Loading } from "@/components/Loading";
import { getAccountsByType, getTotalBalanceByType, getCurrentBalance } from "./accountBalanceUtils";
import { ColorBox } from "@/components/ColorBox";
import { Currency } from "@/components/Currency";

export const AccountBalances = ({
  accountBalances,
  loading,
}: {
  accountBalances: AccountBalanceType[];
  loading: boolean;
}) => {
  const [expandedType, setExpandedType] = useState<AccountType | null>(null);

  if (loading) {
    return <Loading />;
  }

  const depositAccountBalances = getAccountsByType(accountBalances, 'deposit');
  const creditAccountBalances = getAccountsByType(accountBalances, 'credit');
  const loanAccountBalances = getAccountsByType(accountBalances, 'loan');
  const investmentAccountBalances = getAccountsByType(accountBalances, 'investment');

  const hasDepositAccounts = depositAccountBalances.length > 0;
  const hasCreditAccounts = creditAccountBalances.length > 0;
  const hasLoanAccounts = loanAccountBalances.length > 0;
  const hasInvestmentAccounts = investmentAccountBalances.length > 0;

  if (!hasDepositAccounts && !hasCreditAccounts && !hasLoanAccounts && !hasInvestmentAccounts) {
    return <div className="text-center text-gray-500">No accounts found</div>;
  }

  const handleCardClick = (type: AccountType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
      {hasDepositAccounts && <BalanceCard title="Deposit" accountBalances={depositAccountBalances} accountType="deposit" isExpanded={expandedType === 'deposit'} onClick={() => handleCardClick('deposit')} />}
      {hasCreditAccounts && <BalanceCard title="Credit" accountBalances={creditAccountBalances} accountType="credit" isExpanded={expandedType === 'credit'} onClick={() => handleCardClick('credit')} />}
      {hasLoanAccounts && <BalanceCard title="Loan" accountBalances={loanAccountBalances} accountType="loan" isExpanded={expandedType === 'loan'} onClick={() => handleCardClick('loan')} />}
      {hasInvestmentAccounts && <BalanceCard title="Investment" accountBalances={investmentAccountBalances} accountType="investment" isExpanded={expandedType === 'investment'} onClick={() => handleCardClick('investment')} />}
    </div>
  )
};

function BalanceCard({
  title,
  accountType,
  accountBalances,
  isExpanded,
  onClick,
}: {
  title: string;
  accountType: AccountType;
  accountBalances: AccountBalanceType[];
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <ColorBox>
      <div
        className="flex flex-col justify-between h-full items-center p-4 cursor-pointer"
        onClick={onClick}
      >
        <div className="text-sm text-gray-500">
          {title}
        </div>
        <div className="text-3xl font-bold mt-2">
          <Currency amount={getTotalBalanceByType(accountBalances, accountType)} useBold={false} showCents={false} applyColor={false} />
        </div>
        {isExpanded && (
          <div className="w-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {accountBalances.map((account) => (
              <div key={account.id} className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">
                  {account.plaidAccount.nickname || account.plaidAccount.plaidOfficialName}
                </span>
                <span className="text-sm font-medium whitespace-nowrap">
                  <Currency amount={getCurrentBalance(account)} useBold={false} showCents={true} applyColor={false} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ColorBox>
  )
}
