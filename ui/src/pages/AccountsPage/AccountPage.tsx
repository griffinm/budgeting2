import { usePageTitle } from "@/hooks";
import { useContext, useEffect, useState } from "react";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { useAccount, usePlaidAccount } from "@/hooks";
import { useAccountBalances } from "@/hooks/useAccountBalance";
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { ConnectPlaidAccount } from "@/components/ConnectPlaidAccount";
import { PlaidAccount, AccountBalance, AccountType, User } from "@/utils/types";
import { ChangeAccountAccessProps } from "@/hooks";
import { EditableLabel } from "@/components/EditableLabel/EditableLabel";
import { Currency } from "@/components/Currency";
import { Checkbox, Collapse } from "@mantine/core";
import {
  IconBuildingBank,
  IconCreditCard,
  IconReceipt,
  IconChartPie,
  IconChevronDown,
  IconChevronRight,
  IconUsers,
  IconShieldCheck,
} from '@tabler/icons-react';

type AccountTypeConfig = {
  type: AccountType;
  label: string;
  icon: React.ReactNode;
  balanceLabel: string;
};

const ACCOUNT_TYPES: AccountTypeConfig[] = [
  { type: 'deposit', label: 'Deposit Accounts', icon: <IconBuildingBank size={20} />, balanceLabel: 'Total Balance' },
  { type: 'credit', label: 'Credit Cards', icon: <IconCreditCard size={20} />, balanceLabel: 'Total Owed' },
  { type: 'loan', label: 'Loans', icon: <IconReceipt size={20} />, balanceLabel: 'Total Owed' },
  { type: 'investment', label: 'Investments', icon: <IconChartPie size={20} />, balanceLabel: 'Total Value' },
];

function getBalanceForAccount(accountBalances: AccountBalance[], plaidAccountId: number): AccountBalance | undefined {
  // The API returns `id` as the plaid_account id (not plaidAccountId)
  return accountBalances.find(b => b.id === plaidAccountId);
}

function getAccountsByType(plaidAccounts: PlaidAccount[], type: AccountType) {
  return plaidAccounts.filter(a => a.accountType === type);
}

function getTotalForType(accountBalances: AccountBalance[], type: AccountType): number {
  return accountBalances
    .filter(b => b.plaidAccount.accountType === type)
    .reduce((sum, b) => sum + (Number(b.currentBalance) || 0), 0);
}

export default function AccountsPage() {
  const { plaidAccounts, isLoading, refreshAccounts, updateAccountAccess, updatePlaidAccountNickname } = usePlaidAccount();
  const { accountBalances, loading: balancesLoading } = useAccountBalances();
  const setTitle = usePageTitle();
  const { user } = useContext(CurrentUserContext);
  const {
    loading: accountUsersLoading,
    users: accountUsers,
    setAccountId,
  } = useAccount();

  useEffect(() => {
    if (user) {
      setAccountId(user.accountId);
    }
  }, [user, setAccountId]);

  useEffect(() => {
    setTitle(urls.accounts.title());
  }, [setTitle]);

  const handleConnectionSuccess = async () => {
    await refreshAccounts();
  };

  if (isLoading) {
    return <Loading />;
  }

  // Calculate net worth
  const depositTotal = getTotalForType(accountBalances, 'deposit');
  const creditTotal = getTotalForType(accountBalances, 'credit');
  const loanTotal = getTotalForType(accountBalances, 'loan');
  const investmentTotal = getTotalForType(accountBalances, 'investment');
  const netWorth = (depositTotal || 0) + (investmentTotal || 0) - Math.abs(creditTotal || 0) - Math.abs(loanTotal || 0);

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Net Worth Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-8">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)`,
          }}
        />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-primary-200 text-sm font-medium tracking-wide uppercase mb-1">
              Net Worth
            </div>
            <div className="text-white text-4xl font-bold tracking-tight">
              {balancesLoading ? (
                <span className="opacity-50">...</span>
              ) : (
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(netWorth)
              )}
            </div>
            <div className="text-primary-300 text-sm mt-1">
              across {plaidAccounts.length} linked account{plaidAccounts.length !== 1 ? 's' : ''}
            </div>
          </div>
          <ConnectPlaidAccount onSuccess={handleConnectionSuccess} />
        </div>

        {/* Mini breakdown pills */}
        {!balancesLoading && (
          <div className="relative flex flex-wrap gap-3 mt-6">
            {depositTotal !== 0 && (
              <BreakdownPill label="Deposits" amount={depositTotal} />
            )}
            {investmentTotal !== 0 && (
              <BreakdownPill label="Investments" amount={investmentTotal} />
            )}
            {creditTotal !== 0 && (
              <BreakdownPill label="Credit" amount={creditTotal} />
            )}
            {loanTotal !== 0 && (
              <BreakdownPill label="Loans" amount={loanTotal} />
            )}
          </div>
        )}
      </div>

      {/* Account Sections */}
      <div className="flex flex-col gap-6">
        {ACCOUNT_TYPES.map(config => {
          const accounts = getAccountsByType(plaidAccounts, config.type);
          if (accounts.length === 0) return null;

          return (
            <AccountSection
              key={config.type}
              config={config}
              accounts={accounts}
              accountBalances={accountBalances}
              accountUsers={accountUsers}
              accountUsersLoading={accountUsersLoading}
              currentUser={user!}
              onAccountAccessChange={updateAccountAccess}
              onNicknameChange={updatePlaidAccountNickname}
              balancesLoading={balancesLoading}
            />
          );
        })}
      </div>
    </div>
  );
}

function BreakdownPill({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
      <span className="text-primary-200 text-xs">{label}</span>
      <span className="text-white text-sm font-semibold">
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)}
      </span>
    </div>
  );
}

function AccountSection({
  config,
  accounts,
  accountBalances,
  accountUsers,
  accountUsersLoading,
  currentUser,
  onAccountAccessChange,
  onNicknameChange,
  balancesLoading,
}: {
  config: AccountTypeConfig;
  accounts: PlaidAccount[];
  accountBalances: AccountBalance[];
  accountUsers: User[];
  accountUsersLoading: boolean;
  currentUser: User;
  onAccountAccessChange: (props: ChangeAccountAccessProps) => void;
  onNicknameChange: (id: number, nickname: string) => Promise<void>;
  balancesLoading: boolean;
}) {
  const sectionTotal = getTotalForType(accountBalances, config.type);

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="text-primary-600 dark:text-primary-400">
            {config.icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {config.label}
          </h2>
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">
            {accounts.length}
          </span>
        </div>
        {!balancesLoading && sectionTotal !== 0 && (
          <div className="text-right">
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">{config.balanceLabel}</span>
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
              <Currency amount={sectionTotal} applyColor={false} useBold={false} showCents={false} />
            </span>
          </div>
        )}
      </div>

      {/* Account Rows */}
      <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            balance={getBalanceForAccount(accountBalances, account.id)}
            accountUsers={accountUsers}
            accountUsersLoading={accountUsersLoading}
            currentUser={currentUser}
            onAccountAccessChange={onAccountAccessChange}
            onNicknameChange={onNicknameChange}
            balancesLoading={balancesLoading}
          />
        ))}
      </div>
    </div>
  );
}

function AccountRow({
  account,
  balance,
  accountUsers,
  accountUsersLoading,
  currentUser,
  onAccountAccessChange,
  onNicknameChange,
  balancesLoading,
}: {
  account: PlaidAccount;
  balance: AccountBalance | undefined;
  accountUsers: User[];
  accountUsersLoading: boolean;
  currentUser: User;
  onAccountAccessChange: (props: ChangeAccountAccessProps) => void;
  onNicknameChange: (id: number, nickname: string) => Promise<void>;
  balancesLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const authorizedCount = account.users?.length || 0;

  return (
    <div>
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
        {/* Account info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <EditableLabel
              additionalClasses="text-gray-900 dark:text-gray-100 font-semibold text-base"
              id={account.id}
              value={account.nickname || account.plaidOfficialName}
              onSave={onNicknameChange}
            />
          </div>
          <div className="flex items-center gap-3 mt-0.5 pl-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              ****{account.plaidMask}
            </span>
            <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
              {account.plaidSubtype || account.plaidType}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right mr-4">
          {balancesLoading ? (
            <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ) : balance ? (
            <>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                <Currency amount={balance.currentBalance} applyColor={false} useBold={false} showCents={true} />
              </div>
              {balance.availableBalance !== balance.currentBalance && balance.availableBalance !== 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Available: <Currency amount={balance.availableBalance} applyColor={false} useBold={false} showCents={true} />
                </div>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-300 dark:text-gray-600">--</span>
          )}
        </div>

        {/* User access toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IconUsers size={14} />
          <span>{authorizedCount}</span>
          {expanded
            ? <IconChevronDown size={14} className="transition-transform" />
            : <IconChevronRight size={14} className="transition-transform" />
          }
        </button>
      </div>

      {/* Expanded user access panel */}
      <Collapse in={expanded}>
        <div className="px-5 pb-4 pt-1">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-2 mb-3">
              <IconShieldCheck size={14} className="text-primary-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Authorized Users
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              {accountUsersLoading || !accountUsers ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : (
                accountUsers.map((u) => (
                  <AccountAccessCheckbox
                    key={u.id}
                    user={u}
                    account={account}
                    currentUser={currentUser}
                    onChange={onAccountAccessChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

function AccountAccessCheckbox({
  account,
  user,
  currentUser,
  onChange,
}: {
  account: PlaidAccount;
  currentUser: User;
  user: User;
  onChange: (props: ChangeAccountAccessProps) => void;
}) {
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setIsChecked(currentUser.id === user.id || account.users?.some((u) => u.id === user.id) || false);
  }, [currentUser, user, account]);

  const handleChange = () => {
    setIsChecked(!isChecked);
    onChange({ user, plaidAccount: account, isAuthorized: !isChecked });
  };

  return (
    <Checkbox
      label={user.firstName}
      checked={isChecked}
      onChange={handleChange}
      disabled={currentUser.id === user.id}
      size="sm"
    />
  );
}
