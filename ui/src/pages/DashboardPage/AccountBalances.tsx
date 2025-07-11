import { AccountBalance } from "@/utils/types";
import { Loading } from "@/components/Loading";
import { getCurrentBalance } from "./accountBalanceUtils";
import { Card } from "@mantine/core";

export const AccountBalances = ({
  accountBalances,
  loading,
}: {
  accountBalances: AccountBalance[];
  loading: boolean;
}) => {

  return (
    <Card>
      <h2 className="text-2xl mb-4">Account Balances</h2>
      {loading ? (
        <Loading />
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accountBalances.map((accountBalance) => (
          <div className="bg-blue-100 p-4 rounded-md text-center hover-bounce">
            <div className="text-3xl font-bold mb-2">
              {
                new Intl.NumberFormat('en-US', { 
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 }
                ).format(getCurrentBalance(accountBalance))}
              </div>
            <div className="text-sm text-gray-500">
              {accountBalance.plaidAccount.nickname || accountBalance.plaidAccount.plaidOfficialName}
            </div>
          </div>
          ))}
      </div>
      )}
    </Card>
  );
};
