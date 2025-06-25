import { useEffect, useState } from "react";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTagSpendStats } from "@/api";
import { Loading } from "../Loading";
import { Table } from "@mantine/core";
import { TransactionAmount } from "../TransactionAmount";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";
import classNames from "classnames";

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

  return (
    <div>
      <Table highlightOnHover>
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

function MerchantTagRow({ tag, expandedLevel = 0 }: { tag: MerchantTag, expandedLevel?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = tag.children && tag.children.length > 0;
  const rowClasses = classNames('mr-2', {
    'ml-[25px]': expandedLevel === 1,
    'ml-[50px]': expandedLevel === 2,
    'ml-[75px]': expandedLevel === 3,
    'ml-[100px]': expandedLevel === 4,
    'ml-[125px]': expandedLevel === 5,
    'ml-[150px]': expandedLevel === 6,
    'ml-[175px]': expandedLevel === 7,
  });
  
  return (
    <>
      <Table.Tr>
        <Table.Td>
          <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-2">
            {!hasChildren && (
              <span style={{ width: `${(expandedLevel * 25) + 27}px` }}></span>
            )}
            {hasChildren && (expanded ? (
              <span
                className={classNames("cursor-pointer", rowClasses)}
                onClick={() => setExpanded(!expanded)}
              >
                ▼
              </span>
            ) : (
              <span
                className={classNames("cursor-pointer", rowClasses)}
                onClick={() => setExpanded(!expanded)}>
                  ▶
              </span>
            ))}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: `#${tag.color}`,
                }}
              >
              </div>
              <span>{tag.name}</span>
          </div>
        </Table.Td>
        <Table.Td>
          <TransactionAmount amount={tag.totalTransactionAmount || 0} />
        </Table.Td>
      </Table.Tr>
      {expanded && (
        <>
          {tag.children?.map((child) => (
            <MerchantTagRow key={child.id} tag={child} expandedLevel={expandedLevel + 1} />
          ))}
        </>
      )}
    </>
  );
}
