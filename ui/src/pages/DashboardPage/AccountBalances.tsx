import { AccountBalance as AccountBalanceType } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { getCurrentBalance } from "./accountBalanceUtils";
import { ColorBox } from "@/components/ColorBox";
import { Currency } from "@/components/Currency";

export const AccountBalances = ({
  accountBalances,
  loading,
}: {
  accountBalances: AccountBalanceType[];
  loading: boolean;
}) => {

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accountBalances.map((accountBalance) => (
          <AccountBalance accountBalance={accountBalance} key={accountBalance.id} />
        ))}
      </div>
      )}
    </>
  );
};

function AccountBalance({
  accountBalance,
}: {
  accountBalance: AccountBalanceType;
}) {
  return (
    <ColorBox>
      <div className="flex flex-col justify-between h-full items-center p-4">
        <div className="text-sm text-gray-500">
          {accountBalance.plaidAccount.nickname || accountBalance.plaidAccount.plaidOfficialName}
        </div>
        <div className="text-3xl font-bold mt-2">
          <Currency amount={getCurrentBalance(accountBalance)} useBold={false} showCents={false} applyColor={false} />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Last Updated: {new Date(accountBalance.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </ColorBox>
  )
}
