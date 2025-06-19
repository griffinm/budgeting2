import { MerchantSearchParams } from "@/api";
import { MerchantTag, Page, TransactionType as TransactionTypeType } from "@/utils/types";
import { Merchant } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { EditableLabel } from "@/components/EditableLabel";
import { Search } from "./Search";
import { TransactionType } from "@/components/TransactionType";
import { CategoryDisplay } from "../Category/CategoryDisplay";
import { UpdateMerchantParams } from "@/api/merchant-client";
import { urls } from "@/utils/urls";

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
  allMerchantTags: MerchantTag[];
}) {

  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div className="flex justify-baseline items-baseline text-sm text-gray-500 self-end">
          {isLoading ? 'Loading...' : `Found ${page.totalCount.toLocaleString()} merchants`}
        </div>
        <Search searchParams={searchParams} onSetSearchParams={onSetSearchParams} />
      </div>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Default Type</Table.Th>
            <Table.Th>Default Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {merchants.map(merchant => (
            <Table.Tr key={merchant.id}>
              <Table.Td>
                <EditableLabel
                  id={merchant.id}
                  value={merchantDisplayName(merchant)}
                  linkValue={urls.merchant.path(merchant.id)}
                  onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { customName: value } })}
                />
              </Table.Td>
              <Table.Td>
                <TransactionType
                  merchant={merchant}
                  onSave={async (id: number, value: string) => onUpdateMerchant({ id, value: { defaultTransactionType: value as TransactionTypeType } })}
                />
              </Table.Td>
              <Table.Td>
                <CategoryDisplay
                  category={merchant.defaultMerchantTag}
                  onSave={id => onUpdateMerchant({ id: merchant.id, value: { defaultMerchantTagId: id } })}
                  allCategories={allMerchantTags}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td>
              <Pagination
                total={page.totalPages}
                value={page.currentPage}
                onChange={setPage}
                withEdges
                withControls
              />
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </div>
  );
}
