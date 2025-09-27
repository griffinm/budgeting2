import { MerchantSearchParams } from "@/api";
import { MerchantTag, Page, TransactionType as TransactionTypeType, MerchantGroup } from "@/utils/types";
import { Merchant } from "@/utils/types";
import { Pagination } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { EditableLabel } from "@/components/EditableLabel";
import { TransactionType } from "@/components/TransactionType";
import { CategoryDisplay } from "../Category/CategoryDisplay";
import { MerchantGroupDisplay } from "../MerchantGroup/MerchantGroupDisplay";
import { UpdateMerchantParams } from "@/api/merchant-client";
import { urls } from "@/utils/urls";
import { useMediaQuery } from "@mantine/hooks";

export function MerchantsTable({
  merchants,
  isLoading,
  page,
  setPage,
  onUpdateMerchant,
  allMerchantTags,
  allMerchantGroups,
  onUpdateMerchantGroup,
  onGroupCreated,
}: {
  merchants: Merchant[];
  isLoading: boolean;
  page: Page;
  setPage: (page: number) => void;
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  onUpdateMerchant: (params: UpdateMerchantParams) => void;
  allMerchantTags: MerchantTag[];
  allMerchantGroups: MerchantGroup[];
  onUpdateMerchantGroup: (merchantId: number, groupId: number | null) => void;
  onGroupCreated?: (group: MerchantGroup) => void;
}) {
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        {isLoading && merchants.length === 0 ? (
          <div className="flex flex-row justify-center transition-opacity duration-300 ease-in-out">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="flex flex-col transition-opacity duration-300 ease-in-out">
            {merchants.map(merchant => (
              <div key={merchant.id} className="w-full relative border-b border-gray-300 pt-2 hover:bg-gray-100 transition-colors">
                <div className="px-3 flex flex-row">
                  <div className="flex flex-col w-1/4">
                    <EditableLabel
                      id={merchant.id}
                      value={merchantDisplayName(merchant)}
                      linkValue={urls.merchant.path(merchant.id)}
                      onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { customName: value } })}
                    />
                  </div>
                  
                  <div className="flex flex-col w-1/4">
                    <TransactionType
                      merchant={merchant}
                      onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { defaultTransactionType: value as TransactionTypeType } })}
                    />
                  </div>
                  
                  <div className="w-1/4 h-full pb-2 min-h-[60px]">
                    <CategoryDisplay
                      category={merchant.defaultMerchantTag}
                      onSave={({ id, }) => onUpdateMerchant({ id: merchant.id, value: { defaultMerchantTagId: id } })}
                      allCategories={allMerchantTags}
                    />
                  </div>
                  
                  <div className="w-1/4 h-full pb-2 min-h-[60px]">
                    <div className="flex flex-col h-full justify-center">
                      <MerchantGroupDisplay
                        group={merchant.merchantGroup}
                        onSave={(groupId) => onUpdateMerchantGroup(merchant.id, groupId)}
                        allGroups={allMerchantGroups}
                        onGroupCreated={onGroupCreated}
                        merchantId={merchant.id}
                      />
                      {merchant.merchantGroup?.primaryMerchant?.id === merchant.id && (
                        <div className="text-xs text-blue-600 font-medium">
                          Primary
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show empty state when no merchants and not loading */}
            {merchants.length === 0 && !isLoading && (
              <div className="flex justify-center py-8">
                <div className="text-sm text-gray-500">No merchants found</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-row justify-center my-3">
        <Pagination
          size={isMobile ? 'xs' : 'md'}
          total={page.totalPages}
          value={page.currentPage}
          onChange={setPage}
          withEdges
          withControls
        />
      </div>
    </div>
  );
}
