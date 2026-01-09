import { AccountBalance as AccountBalanceType, AccountType } from "@/utils/types";
import { useState } from "react";
import { Loading } from "@/components/Loading";
import { getAccountsByType, getTotalBalanceByType, getCurrentBalance } from "./accountBalanceUtils";
import { ColorBox } from "@/components/ColorBox";
import { Currency } from "@/components/Currency";
import { AccountBalanceHistoryModal } from "./AccountBalanceHistoryModal";
import { IconChartLine } from '@tabler/icons-react';

export const AccountBalances = ({
  accountBalances,
  loading,
}: {
  accountBalances: AccountBalanceType[];
  loading: boolean;
}) => {
  const [expandedType, setExpandedType] = useState<AccountType | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

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

  const handleAccountClick = (accountId: number, accountName: string) => {
    setSelectedAccount({ id: accountId, name: accountName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleTypeHistoryClick = (type: AccountType, typeName: string) => {
    setSelectedAccountType(type);
    setSelectedAccount({ id: 0, name: `${typeName} Accounts` });
    setIsTypeModalOpen(true);
  };

  const handleCloseTypeModal = () => {
    setIsTypeModalOpen(false);
    setSelectedAccountType(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start w-full">
        {hasDepositAccounts && <BalanceCard title="Deposit" accountBalances={depositAccountBalances} accountType="deposit" isExpanded={expandedType === 'deposit'} onClick={() => handleCardClick('deposit')} onAccountClick={handleAccountClick} onTypeHistoryClick={handleTypeHistoryClick} />}
        {hasCreditAccounts && <BalanceCard title="Credit" accountBalances={creditAccountBalances} accountType="credit" isExpanded={expandedType === 'credit'} onClick={() => handleCardClick('credit')} onAccountClick={handleAccountClick} onTypeHistoryClick={handleTypeHistoryClick} />}
        {hasLoanAccounts && <BalanceCard title="Loan" accountBalances={loanAccountBalances} accountType="loan" isExpanded={expandedType === 'loan'} onClick={() => handleCardClick('loan')} onAccountClick={handleAccountClick} onTypeHistoryClick={handleTypeHistoryClick} />}
        {hasInvestmentAccounts && <BalanceCard title="Investment" accountBalances={investmentAccountBalances} accountType="investment" isExpanded={expandedType === 'investment'} onClick={() => handleCardClick('investment')} onAccountClick={handleAccountClick} onTypeHistoryClick={handleTypeHistoryClick} />}
      </div>

      {/* Individual account history modal */}
      <AccountBalanceHistoryModal
        plaidAccountId={selectedAccount?.id || null}
        accountName={selectedAccount?.name || ''}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Account type aggregated history modal */}
      <AccountBalanceHistoryModal
        accountType={selectedAccountType}
        accountName={selectedAccount?.name || ''}
        isOpen={isTypeModalOpen}
        onClose={handleCloseTypeModal}
      />
    </>
  )
};

function BalanceCard({
  title,
  accountType,
  accountBalances,
  isExpanded,
  onClick,
  onAccountClick,
  onTypeHistoryClick,
}: {
  title: string;
  accountType: AccountType;
  accountBalances: AccountBalanceType[];
  isExpanded: boolean;
  onClick: () => void;
  onAccountClick: (accountId: number, accountName: string) => void;
  onTypeHistoryClick: (type: AccountType, typeName: string) => void;
}) {
  return (
    <ColorBox>
      <div className="flex flex-col justify-between h-full items-center p-4">
        {/* Header with title and chart icon */}
        <div className="w-full flex justify-between items-start mb-2">
          <div className="text-sm text-gray-500">{title}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTypeHistoryClick(accountType, title);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={`View ${title} balance history`}
          >
            <IconChartLine size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Total balance - clickable to expand/collapse */}
        <div
          className="flex flex-col items-center cursor-pointer flex-1 w-full"
          onClick={onClick}
        >
          <div className="text-3xl font-bold mt-2">
            <Currency amount={getTotalBalanceByType(accountBalances, accountType)} useBold={false} showCents={false} applyColor={false} />
          </div>
          {/* Expanded accounts list */}
          {isExpanded && (
            <div className="w-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {accountBalances.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccountClick(
                      account.plaidAccount.id,
                      account.plaidAccount.nickname || account.plaidAccount.plaidOfficialName
                    );
                  }}
                >
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
      </div>
    </ColorBox>
  )
}
