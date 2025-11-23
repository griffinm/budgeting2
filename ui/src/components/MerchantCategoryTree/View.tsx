import { useEffect, useState } from "react";
import { MerchantTag } from "@/utils/types";
import { 
  fetchMerchantTagSpendStats,
  updateMerchantTag,
  UpdateMerchantTagRequest,
} from "@/api";
import { Loading } from "../Loading";
import { Button } from "@mantine/core";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";
import { 
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { DateInput } from "@mantine/dates";
import { TransactionModal } from "./TransactionModal";
import { MerchantTagRow } from "./MerchantTagRow";
import '@mantine/dates/styles.css';

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
  const [monthsBack, setMonthsBack] = useState(1);
  const [currentLoadingMerchantTagId, setCurrentLoadingMerchantTagId] = useState<number | undefined>();

  useEffect(() => {
    setLoading(true);
    fetchMerchantTagSpendStats({ startDate: new Date(startDate || defaultStartDate), endDate: new Date(endDate || defaultEndDate) })
    .then((merchantTagSpendStats) => {
      setMerchantTags(formatMerchantTagsAsTree({ merchantTags: merchantTagSpendStats as MerchantTag[] }));
    })
    .finally(() => {
      setLoading(false);
    });
  }, [startDate, endDate]);

  const startDateValue = startDate ? new Date(startDate) : new Date(defaultStartDate);
  const endDateValue = endDate ? new Date(endDate) : new Date(defaultEndDate);

  const setDates = (monthsBack: number) => {
    setStartDate(startOfMonth(subMonths(new Date(), monthsBack)));
    setEndDate(defaultEndDate);
    setMonthsBack(monthsBack);
  }

  const onViewTransactions = (merchantTag: MerchantTag) => {
    setSelectedMerchantTag(merchantTag);
    setIsTransactionModalOpen(true);
  }

    const onSaveBudget = (params: UpdateMerchantTagRequest) => {
    setCurrentLoadingMerchantTagId(params.id);
    updateMerchantTag({ data: params })
      .then(() => {
        setLoading(true);
        fetchMerchantTagSpendStats({ startDate: new Date(startDate || defaultStartDate), endDate: new Date(endDate || defaultEndDate) })
        .then((merchantTagSpendStats) => {
          setMerchantTags(formatMerchantTagsAsTree({ merchantTags: merchantTagSpendStats as MerchantTag[] }));
        })
        .finally(() => {
          setLoading(false);
        });
      })
      .finally(() => {
        setCurrentLoadingMerchantTagId(undefined);
      });
  }

  const renderTable = () => {
    return (
      <div className="w-full flex flex-col overflow-x-auto">
        {merchantTags.map((tag) => (
          <MerchantTagRow
            key={tag.id}
            tag={tag}
            onSave={onSaveBudget}
            onViewTransactions={onViewTransactions}
            monthsBack={monthsBack}
            isSaving={currentLoadingMerchantTagId === tag.id}
          />
        ))}
      </div>
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
