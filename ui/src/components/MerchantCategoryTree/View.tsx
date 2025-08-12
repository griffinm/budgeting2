import { useEffect, useState } from "react";
import { MerchantTag } from "@/utils/types";
import { fetchMerchantTagSpendStats } from "@/api";
import { Loading } from "../Loading";
import { Button, Table } from "@mantine/core";
import { TransactionAmount } from "../TransactionAmount";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";
import classNames from "classnames";
import { 
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { DateInput } from "@mantine/dates";
import { TransactionModal } from "./TransactionModal";
import { Link } from "react-router-dom";
import { urls } from "@/utils/urls";

const defaultStartDate = startOfMonth(new Date());
const defaultEndDate = endOfMonth(new Date());

const quickOptions = [
  { label: "This Month", monthsBack: 0 },
  { label: "Last Month", monthsBack: 1 },
  { label: "Last 3 Months", monthsBack: 3 },
  { label: "Last 6 Months", monthsBack: 6 },
  { label: "Last 12 Months", monthsBack: 12 },
]

export const View = () => {
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedMerchantTag, setSelectedMerchantTag] = useState<MerchantTag | undefined>();
  useEffect(() => {
    console.log("Here")
    setLoading(true);
    fetchMerchantTagSpendStats({ startDate: new Date(startDate || defaultStartDate), endDate: new Date(endDate || defaultEndDate) })
    .then((merchantTagSpendStats) => {
      setMerchantTags(formatMerchantTagsAsTree({ merchantTags: merchantTagSpendStats }));
      setLoading(false);
    });
  }, [startDate, endDate]);

  const startDateValue = startDate ? new Date(startDate) : new Date(defaultStartDate);
  const endDateValue = endDate ? new Date(endDate) : new Date(defaultEndDate);

  const setDates = (monthsBack: number) => {
    setStartDate(startOfMonth(subMonths(new Date(), monthsBack)));
    setEndDate(defaultEndDate);
  }

  const onViewTransactions = (merchantTag: MerchantTag) => {
    setSelectedMerchantTag(merchantTag);
    setIsTransactionModalOpen(true);
  }

  const renderTable = () => {
    return (
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Total Transaction Amount</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {merchantTags.map((tag) => (
            <MerchantTagRow
              key={tag.id}
              tag={tag}
              onViewTransactions={onViewTransactions}
            />
          ))}
        </Table.Tbody>
      </Table>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-5 sm:items-end">
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <DateInput
            size="xs"
            value={startDateValue}
            onChange={(date) => setStartDate(date ? new Date(date) : null)}
            label="Start Date"
          />
          <DateInput
            size="xs"
            value={endDateValue}
            onChange={(date) => setEndDate(date ? new Date(date) : null)}
            label="End Date"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quickOptions.map((option) => (
            <Button size="xs" variant="outline" key={option.label} onClick={() => setDates(option.monthsBack)}>
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      {loading ? <Loading /> : renderTable()}
      <TransactionModal
        merchantTag={selectedMerchantTag}
        onClose={() => setIsTransactionModalOpen(false)}
        isOpen={isTransactionModalOpen}
      />
    </div>
  );
};

function MerchantTagRow({ 
  tag, 
  expandedLevel = 0,
  onViewTransactions,
}: { 
  tag: MerchantTag; 
  expandedLevel?: number; 
  onViewTransactions: (merchantTag: MerchantTag) => void;
}) {
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
              <div>
                <Link to={urls.merchantTag.path(tag.id)}>{tag.name}</Link>
              </div>
          </div>
        </Table.Td>
        <Table.Td>
          <TransactionAmount amount={tag.totalTransactionAmount || 0} />
        </Table.Td>
        <Table.Td>
          <Button size="xs" variant="transparent" onClick={() => onViewTransactions(tag)}>
            View Transactions
          </Button>
        </Table.Td>
      </Table.Tr>
      {expanded && (
        <>
          {tag.children?.map((child) => (
            <MerchantTagRow
              key={child.id}
              tag={child}
              expandedLevel={expandedLevel + 1}
              onViewTransactions={(merchantTag) => onViewTransactions(merchantTag)}
            />
          ))}
        </>
      )}
    </>
  );
}
