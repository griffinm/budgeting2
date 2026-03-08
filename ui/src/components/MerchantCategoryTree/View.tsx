import { useEffect, useState } from "react";
import { MerchantCategory } from "@/utils/types";
import {
  createMerchantCategory,
  CreateMerchantCategoryRequest,
  fetchMerchantCategorySpendStats,
  fetchMerchantCategories,
  updateMerchantCategory,
  UpdateMerchantCategoryRequest,
} from "@/api";
import { Loading } from "../Loading";
import { Button, Select, SegmentedControl } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { formatMerchantCategoriesAsTree } from "@/utils/merchantCategoryUtils";
import {
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { DateInput } from "@mantine/dates";
import { TransactionModal } from "./TransactionModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { MerchantCategoryRow } from "./MerchantCategoryRow";
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
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedMerchantCategory, setSelectedMerchantCategory] = useState<MerchantCategory | undefined>();
  const [monthsBack, setMonthsBack] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMerchantCategory, setEditingMerchantCategory] = useState<MerchantCategory | undefined>();
  const [rawMerchantCategories, setRawMerchantCategories] = useState<MerchantCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fetchMerchantCategorySpendStats({ startDate: new Date(startDate || defaultStartDate), endDate: new Date(endDate || defaultEndDate) }),
      fetchMerchantCategories(),
    ])
    .then(([merchantCategorySpendStats, allCategories]) => {
      setMerchantCategories(formatMerchantCategoriesAsTree({ merchantCategories: merchantCategorySpendStats as MerchantCategory[] }));
      setRawMerchantCategories(allCategories);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshData();
  }, [startDate, endDate]);

  const onViewTransactions = (merchantCategory: MerchantCategory) => {
    setSelectedMerchantCategory(merchantCategory);
    setIsTransactionModalOpen(true);
  }

  const onEdit = (merchantCategory: MerchantCategory) => {
    setEditingMerchantCategory(merchantCategory);
    setIsEditModalOpen(true);
  };

  const [editErrors, setEditErrors] = useState<string[]>([]);

  const onSaveEdit = (params: UpdateMerchantCategoryRequest) => {
    setIsSaving(true);
    setEditErrors([]);
    updateMerchantCategory({ data: params })
      .then(() => {
        setIsEditModalOpen(false);
        setEditingMerchantCategory(undefined);
        refreshData();
      })
      .catch((error) => {
        setEditErrors(error.response?.data?.errors || ["Something went wrong"]);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const onCreateCategory = (params: CreateMerchantCategoryRequest) => {
    setIsSaving(true);
    setEditErrors([]);
    createMerchantCategory({ data: params })
      .then(() => {
        setIsEditModalOpen(false);
        refreshData();
      })
      .catch((error) => {
        setEditErrors(error.response?.data?.errors || ["Something went wrong"]);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const renderTable = () => {
    return (
      <div className="w-full flex flex-col overflow-x-auto">
        {merchantCategories.map((category) => (
          <MerchantCategoryRow
            key={category.id}
            tag={category}
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
      <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DateFields
            onChange={({ startDate, endDate, monthsBack }) => {
              setStartDate(startDate);
              setEndDate(endDate);
              setMonthsBack(monthsBack);
            }}
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingMerchantCategory(undefined);
            setIsEditModalOpen(true);
          }}
        >
          New Category
        </Button>
      </div>

      <div className="border border-b border-gray-200 border-1 mb-3" />

      {loading ? <Loading /> : renderTable()}
      <TransactionModal
        merchantCategory={selectedMerchantCategory}
        onClose={() => setIsTransactionModalOpen(false)}
        isOpen={isTransactionModalOpen}
      />
      <EditCategoryModal
        merchantCategory={editingMerchantCategory}
        allMerchantCategories={rawMerchantCategories}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMerchantCategory(undefined);
          setEditErrors([]);
        }}
        onSave={onSaveEdit}
        onCreate={onCreateCategory}
        isSaving={isSaving}
        errors={editErrors}
      />
    </div>
  );
};

interface DateFieldsProps {
  onChange: (params: { startDate: Date; endDate: Date; monthsBack: number }) => void;
}

const DateFields = ({ onChange }: DateFieldsProps) => {
  const [selectedOption, setSelectedOption] = useState('0');
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

  const segmentData = [
    ...quickOptions.map((option) => ({
      label: option.label,
      value: String(option.monthsBack),
    })),
    { label: "Custom", value: "custom" },
  ];

  const handleSegmentChange = (value: string) => {
    setSelectedOption(value);
    if (value !== 'custom') {
      const monthsBack = Number(value);
      const newStart = startOfMonth(subMonths(new Date(), monthsBack));
      const newEnd = defaultEndDate;
      setStartDate(newStart);
      setEndDate(newEnd);
      onChange({ startDate: newStart, endDate: newEnd, monthsBack });
    }
  };

  return (
    <>
      <div className="hidden sm:block">
        <SegmentedControl
          size="sm"
          value={selectedOption}
          onChange={handleSegmentChange}
          data={segmentData}
        />
      </div>
      <div className="sm:hidden">
        <Select
          size="sm"
          value={selectedOption}
          onChange={(value) => value && handleSegmentChange(value)}
          data={segmentData}
        />
      </div>
      {selectedOption === 'custom' && (
        <div className="flex gap-2 items-center">
          <DateInput
            size="sm"
            value={startDate}
            onChange={(date) => {
              const d = date ? new Date(date) : null;
              setStartDate(d);
              if (d && endDate) {
                onChange({ startDate: d, endDate, monthsBack: 0 });
              }
            }}
            placeholder="Start date"
          />
          <span>—</span>
          <DateInput
            size="sm"
            value={endDate}
            onChange={(date) => {
              const d = date ? new Date(date) : null;
              setEndDate(d);
              if (startDate && d) {
                onChange({ startDate, endDate: d, monthsBack: 0 });
              }
            }}
            placeholder="End date"
          />
        </div>
      )}
    </>
  );
};
