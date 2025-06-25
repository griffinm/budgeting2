import { useEffect, useState } from "react";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTagSpendStats } from "@/api";
import { Loading } from "../Loading";
import { Table } from "@mantine/core";
import { TransactionAmount } from "../TransactionAmount";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";

export const View = () => {
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMerchantTagSpendStats({}).then((merchantTags) => {
      setMerchantTags(formatMerchantTagsAsTree({ merchantTags }));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  console.log(merchantTags);

  return (
    <div>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Total Transaction Amount</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {merchantTags.map((tag) => (
            <MerchantTagRow key={tag.id} tag={tag} />
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

function MerchantTagRow({ tag }: { tag: MerchantTag }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = tag.children && tag.children.length > 0;

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <div onClick={() => setExpanded(!expanded)}>
            {!hasChildren && (
              <span className="mr-7"></span>
            )}
            {hasChildren && (expanded ? (
              <span className="cursor-pointer mr-2" onClick={() => setExpanded(!expanded)}>▼</span>
            ) : (
              <span className="cursor-pointer mr-2" onClick={() => setExpanded(!expanded)}>▶</span>
            ))}
            {tag.name}
          </div>
        </Table.Td>
        <Table.Td>
          <TransactionAmount amount={tag.totalTransactionAmount || 0} />
        </Table.Td>
      </Table.Tr>
      {expanded && (
        <>
          {tag.children?.map((child) => (
            <MerchantTagRow key={child.id} tag={child} />
          ))}
        </>
      )}
    </>
  );
}
