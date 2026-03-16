import { MerchantCategory, TransactionType as TransactionTypeType, MerchantGroup, Merchant } from "@/utils/types";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { EditableLabel } from "@/components/EditableLabel";
import { TransactionType } from "@/components/TransactionType";
import { CategoryDisplay } from "../Category/CategoryDisplay";
import { MerchantGroupDisplay } from "../MerchantGroup/MerchantGroupDisplay";
import { UpdateMerchantParams } from "@/api/merchant-client";
import { Logo } from "../TransactionsTable/Logo";
import { urls } from "@/utils/urls";

export function MerchantRow({
  merchant,
  onUpdateMerchant,
  allMerchantCategories,
  allMerchantGroups,
  onUpdateMerchantGroup,
  onGroupCreated,
}: {
  merchant: Merchant;
  onUpdateMerchant: (params: UpdateMerchantParams) => void;
  allMerchantCategories: MerchantCategory[];
  allMerchantGroups: MerchantGroup[];
  onUpdateMerchantGroup: (merchantId: number, groupId: number | null) => void;
  onGroupCreated?: (group: MerchantGroup) => void;
}) {
  return (
    <div className="w-full relative border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] transition-colors">
      <div className="px-3 py-2 flex flex-row items-center min-h-[60px]">
        <div className="flex flex-row items-center gap-2 w-1/4">
          <Logo merchant={merchant} size="md" />
          <div className="flex flex-col">
            <EditableLabel
              id={merchant.id}
              value={merchantDisplayName(merchant)}
              linkValue={urls.merchant.path(merchant.id)}
              onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { customName: value } })}
            />
            {merchant.transactionCount != null && (
              <div className="text-xs text-gray-400 pl-1">{merchant.transactionCount} transactions</div>
            )}
          </div>
        </div>

        <div className="w-1/4">
          <TransactionType
            merchant={merchant}
            onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { defaultTransactionType: value as TransactionTypeType } })}
          />
        </div>

        <div className="w-1/4">
          <CategoryDisplay
            category={merchant.defaultMerchantTag}
            onSave={({ id }) => onUpdateMerchant({ id: merchant.id, value: { defaultMerchantTagId: id } })}
            allCategories={allMerchantCategories}
          />
        </div>

        <div className="w-1/4">
          <div className="flex flex-col">
            <MerchantGroupDisplay
              group={merchant.merchantGroup}
              onSave={(groupId) => onUpdateMerchantGroup(merchant.id, groupId)}
              allGroups={allMerchantGroups}
              onGroupCreated={onGroupCreated}
              merchantId={merchant.id}
            />
            {merchant.merchantGroup?.primaryMerchant?.id === merchant.id && (
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Primary
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
