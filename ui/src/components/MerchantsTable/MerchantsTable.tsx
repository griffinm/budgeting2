import { MerchantSearchParams } from "@/api";
import { MerchantTag, Page, TransactionType as TransactionTypeType } from "@/utils/types";
import { Merchant } from "@/utils/types";
import { Card, Pagination } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { EditableLabel } from "@/components/EditableLabel";
import { Search } from "./Search";
import { TransactionType } from "@/components/TransactionType";
import { CategoryDisplay } from "../Category/CategoryDisplay";
import { UpdateMerchantParams } from "@/api/merchant-client";
import { urls } from "@/utils/urls";
import { useMediaQuery } from "@mantine/hooks";

export function MerchantsTable({
  merchants,
  isLoading,
  page,
  setPage,
  searchParams,
  onSetSearchParams,
  onUpdateMerchant,
  allMerchantTags,
}: {
  merchants: Merchant[];
  isLoading: boolean;
  page: Page;
  setPage: (page: number) => void;
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  onUpdateMerchant: (params: UpdateMerchantParams) => void;
  allMerchantTags?: MerchantTag[];
}) {
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} merchants`}
        </div>
        <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} />
      </div>

      <div className="flex flex-row justify-center my-3">
        <Pagination
          size={isMobile ? 'xs' : 'md'}
          total={page.totalPages}
          value={page.currentPage}
          onChange={setPage}
          withEdges
          withControls
        />
      </div>

      <div className="flex w-full gap-3 flex-col">
        {merchants.map(merchant => (
          <Card key={merchant.id} p="xs">
            <div className="flex flex-row gap-2">
              <div className="w-full md:w-1/3">
                <EditableLabel
                  id={merchant.id}
                  value={merchantDisplayName(merchant)}
                  linkValue={urls.merchant.path(merchant.id)}
                  onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { customName: value } })}
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <TransactionType
                  merchant={merchant}
                  onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { defaultTransactionType: value as TransactionTypeType } })}
                />
              </div>
              
              <div className="w-full md:w-1/3">
                <CategoryDisplay
                  category={merchant.defaultMerchantTag}
                  onSave={({ id, }) => onUpdateMerchant({ id: merchant.id, value: { defaultMerchantTagId: id } })}
                  allCategories={allMerchantTags}
                />
              </div>
            </div>
          </Card>
        ))}

        <div className="flex flex-row justify-center my-3">
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
    </div>
  );
}
