import { useMemo, useState } from "react";
import { Button, Paper, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTag } from "@tabler/icons-react";
import classNames from "classnames";
import { differenceInCalendarMonths } from "date-fns";
import { MerchantCategory } from "@/utils/types";
import { CreateMerchantCategoryRequest, UpdateMerchantCategoryRequest } from "@/api";
import { useCategorySpendData } from "@/hooks/useCategorySpendData";
import { findCategoryInTree, getDescendantIds } from "@/utils/merchantCategoryUtils";
import { Currency } from "../Currency";
import { Loading } from "../Loading";
import { CategoryCard } from "./CategoryCard";
import { CategoryDnd, CategoryHandlers } from "./CategoryRow";
import { DateRange, DateRangeControl, rangeForOption } from "./DateRangeControl";
import { EditCategoryModal } from "./EditCategoryModal";
import { SummaryStrip } from "./SummaryStrip";
import { TransactionModal } from "./TransactionModal";
import { buildSparklineData } from "./TrendSparkline";

export const View = () => {
  const [range, setRange] = useState<DateRange>(() => rangeForOption("this")!);
  const {
    tree,
    flat,
    monthlyByTagId,
    uncategorizedTotal,
    loading,
    saving,
    create,
    update,
    remove,
  } = useCategorySpendData(range);
  const monthsInRange = Math.max(
    differenceInCalendarMonths(range.endDate, range.startDate) + 1,
    1,
  );

  const [transactionCategory, setTransactionCategory] = useState<MerchantCategory | undefined>();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MerchantCategory | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const extractErrors = (error: unknown): string[] =>
    (error as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors || [
      "Something went wrong",
    ];

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(undefined);
    setEditErrors([]);
  };

  const openNewCategoryModal = () => {
    setEditingCategory(undefined);
    setEditErrors([]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (params: UpdateMerchantCategoryRequest) => {
    setEditErrors([]);
    try {
      await update(params);
      closeEditModal();
    } catch (error) {
      setEditErrors(extractErrors(error));
    }
  };

  const handleCreate = async (params: CreateMerchantCategoryRequest) => {
    setEditErrors([]);
    try {
      await create(params);
      closeEditModal();
    } catch (error) {
      setEditErrors(extractErrors(error));
    }
  };

  const handleDelete = (category: MerchantCategory) => {
    const descendantCount = getDescendantIds(category).length - 1;
    modals.openConfirmModal({
      title: `Delete ${category.name}?`,
      children: (
        <Text size="sm">
          {descendantCount > 0 &&
            `Its ${descendantCount} ${descendantCount === 1 ? "subcategory" : "subcategories"} will move up a level. `}
          Transactions in this category will become uncategorized. This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        remove(category.id)
          .then(() => notifications.show({ message: `Deleted ${category.name}`, color: "green" }))
          .catch(() =>
            notifications.show({ message: `Could not delete ${category.name}`, color: "red" }),
          );
      },
    });
  };

  const handlers: CategoryHandlers = {
    onEdit: (category) => {
      setEditingCategory(category);
      setEditErrors([]);
      setIsEditModalOpen(true);
    },
    onViewTransactions: (category) => {
      setTransactionCategory(category);
      setIsTransactionModalOpen(true);
    },
    onDelete: handleDelete,
    onSaveBudget: (category, targetBudget) => {
      update({ id: category.id, data: { targetBudget } }).catch(() =>
        notifications.show({
          message: `Could not update budget for ${category.name}`,
          color: "red",
        }),
      );
    },
  };

  const draggingCategory =
    draggingId !== null ? findCategoryInTree(tree, draggingId) : undefined;
  const draggingDescendants = useMemo(
    () =>
      draggingCategory
        ? new Set(getDescendantIds(draggingCategory))
        : new Set<number>(),
    [draggingCategory],
  );

  const dnd: CategoryDnd = {
    draggingId,
    startDrag: (category) => setDraggingId(category.id),
    endDrag: () => setDraggingId(null),
    canDropOn: (targetId) => {
      if (!draggingCategory) return false;
      if (targetId === null) return draggingCategory.parentMerchantTagId !== null;
      if (draggingDescendants.has(targetId)) return false;
      return targetId !== draggingCategory.parentMerchantTagId;
    },
    dropOn: (targetId) => {
      if (!draggingCategory) return;
      const dragged = draggingCategory;
      const target = targetId !== null ? findCategoryInTree(tree, targetId) : undefined;
      setDraggingId(null);
      modals.openConfirmModal({
        title: "Move category",
        children: (
          <Text size="sm">
            Move <b>{dragged.name}</b>{" "}
            {target ? (
              <>
                under <b>{target.name}</b>
              </>
            ) : (
              "to the top level"
            )}
            ?
          </Text>
        ),
        labels: { confirm: "Move", cancel: "Cancel" },
        onConfirm: () => {
          update({ id: dragged.id, data: { parentMerchantTagId: targetId } }).catch(() =>
            notifications.show({ message: `Could not move ${dragged.name}`, color: "red" }),
          );
        },
      });
    },
  };

  const renderEmptyState = () => (
    <Paper p="xl" radius="md" withBorder className="flex flex-col items-center gap-3 py-16">
      <IconTag size={40} stroke={1.5} className="text-gray-300 dark:text-gray-600" />
      <div className="text-lg font-semibold">No categories yet</div>
      <Text size="sm" c="dimmed" className="text-center max-w-sm">
        Categories group your merchants so you can budget and track spending by area — like
        Food, Home, or Travel.
      </Text>
      <Button leftSection={<IconPlus size={16} />} onClick={openNewCategoryModal}>
        New Category
      </Button>
    </Paper>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <DateRangeControl onChange={setRange} />
        <Button
          size="sm"
          variant="outline"
          leftSection={<IconPlus size={16} />}
          onClick={openNewCategoryModal}
        >
          New Category
        </Button>
      </div>

      {loading ? (
        <Loading />
      ) : tree.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <SummaryStrip
            tree={tree}
            uncategorizedTotal={uncategorizedTotal}
            monthsInRange={monthsInRange}
          />

          {draggingId !== null && dnd.canDropOn(null) && (
            <TopLevelDropZone onDropTopLevel={() => dnd.dropOn(null)} />
          )}

          <div className="flex flex-col gap-3">
            {tree.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                monthsMultiplier={monthsInRange}
                sparklineData={buildSparklineData(monthlyByTagId.get(category.id))}
                defaultExpanded={tree.length <= 3}
                handlers={handlers}
                dnd={dnd}
              />
            ))}

            {uncategorizedTotal > 0 && (
              <Paper
                p={0}
                radius="md"
                withBorder
                shadow="none"
                style={{ borderLeft: "4px solid var(--mantine-color-gray-4)" }}
              >
                <div className="flex items-center gap-2.5 px-3 sm:px-4 py-3">
                  <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    Uncategorized
                  </span>
                  <span className="ml-auto">
                    <Currency
                      amount={uncategorizedTotal}
                      applyColor={false}
                      showCents={false}
                      useBold={true}
                    />
                  </span>
                </div>
              </Paper>
            )}
          </div>
        </>
      )}

      <TransactionModal
        merchantCategory={transactionCategory}
        onClose={() => setIsTransactionModalOpen(false)}
        isOpen={isTransactionModalOpen}
      />
      <EditCategoryModal
        merchantCategory={editingCategory}
        allMerchantCategories={flat}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
        onCreate={handleCreate}
        isSaving={saving}
        errors={editErrors}
      />
    </div>
  );
};

function TopLevelDropZone({ onDropTopLevel }: { onDropTopLevel: () => void }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={classNames(
        "border-2 border-dashed rounded-md px-4 py-3 text-sm text-center transition-colors",
        dragOver
          ? "border-primary-400 bg-primary-0 text-primary-700 dark:bg-[var(--mantine-color-dark-6)] dark:text-primary-200"
          : "border-gray-300 dark:border-[var(--mantine-color-dark-4)] text-gray-500 dark:text-gray-400",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDropTopLevel();
      }}
    >
      Drop here to move to the top level
    </div>
  );
}
