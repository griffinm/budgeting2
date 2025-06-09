import { MerchantSearchParams } from "@/api";
import { Page } from "@/utils/types";
import { Merchant } from "@/utils/types";
import { Pagination, Table } from "@mantine/core";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { EditableLabel } from "@/components/EditableLabel";
import { Search } from "./Search";

export function MerchantsTable({
  merchants,
  isLoading,
  page,
  setPage,
  searchParams,
  onSetSearchParams,
  onUpdateMerchant,
}: {
  merchants: Merchant[];
  isLoading: boolean;
  page: Page;
  setPage: (page: number) => void;
  searchParams: MerchantSearchParams;
  onSetSearchParams: (searchParams: MerchantSearchParams) => void;
  onUpdateMerchant: (id: number, value: Partial<Merchant>) => void;
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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {merchants.map(merchant => (
            <Table.Tr key={merchant.id}>
              <Table.Td>
                <EditableLabel id={merchant.id} value={merchantDisplayName(merchant)} onSave={async (id: number, value: string) => await onUpdateMerchant(id, { customName: value })} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={2}>
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