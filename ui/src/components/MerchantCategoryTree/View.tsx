import { useEffect, useState } from "react";
import { MerchantTag } from "@/utils/types";
import {
  createMerchantTag,
  CreateMerchantTagRequest,
  fetchMerchantTagSpendStats,
  fetchMerchantTags,
  updateMerchantTag,
  UpdateMerchantTagRequest,
} from "@/api";
import { Loading } from "../Loading";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { formatMerchantTagsAsTree } from "@/utils/merchantTagUtils";
import {
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { DateInput } from "@mantine/dates";
import { TransactionModal } from "./TransactionModal";
import { EditCategoryModal } from "./EditCategoryModal";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMerchantTag, setEditingMerchantTag] = useState<MerchantTag | undefined>();
  const [rawMerchantTags, setRawMerchantTags] = useState<MerchantTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fetchMerchantTagSpendStats({ startDate: new Date(startDate || defaultStartDate), endDate: new Date(endDate || defaultEndDate) }),
      fetchMerchantTags(),
    ])
    .then(([merchantTagSpendStats, allTags]) => {
      setMerchantTags(formatMerchantTagsAsTree({ merchantTags: merchantTagSpendStats as MerchantTag[] }));
      setRawMerchantTags(allTags);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshData();
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

  const onEdit = (merchantTag: MerchantTag) => {
    setEditingMerchantTag(merchantTag);
    setIsEditModalOpen(true);
  };

  const onSaveEdit = (params: UpdateMerchantTagRequest) => {
    setIsSaving(true);
    updateMerchantTag({ data: params })
      .then(() => {
        setIsEditModalOpen(false);
        setEditingMerchantTag(undefined);
        refreshData();
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const onCreateCategory = (params: CreateMerchantTagRequest) => {
    setIsSaving(true);
    createMerchantTag({ data: params })
      .then(() => {
        setIsEditModalOpen(false);
        refreshData();
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const renderTable = () => {
    return (
      <div className="w-full flex flex-col overflow-x-auto">
        {merchantTags.map((tag) => (
          <MerchantTagRow
            key={tag.id}
            tag={tag}
            onEdit={onEdit}
            onViewTransactions={onViewTransactions}
            monthsBack={monthsBack}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-5 sm:items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
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
        <Button
          size="xs"
          variant="outline"
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingMerchantTag(undefined);
            setIsEditModalOpen(true);
          }}
        >
          New Category
        </Button>
      </div>
      {loading ? <Loading /> : renderTable()}
      <TransactionModal
        merchantTag={selectedMerchantTag}
        onClose={() => setIsTransactionModalOpen(false)}
        isOpen={isTransactionModalOpen}
      />
      <EditCategoryModal
        merchantTag={editingMerchantTag}
        allMerchantTags={rawMerchantTags}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMerchantTag(undefined);
        }}
        onSave={onSaveEdit}
        onCreate={onCreateCategory}
        isSaving={isSaving}
      />
    </div>
  );
};
