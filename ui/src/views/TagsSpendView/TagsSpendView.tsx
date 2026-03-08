import { MerchantCategory, Page, Tag, TagReport, TagSpendStats, Transaction } from "@/utils/types";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { FilterCard } from "./FilterCard";
import { ChartCard } from "./ChartCard";
import { TransactionsCard } from "./TransactionsCard";

export function TagsSpendView({
  tags,
  loadingTags,
  includedTagIds,
  setIncludedTagIds,
  omittedTagIds,
  setOmittedTagIds,
  monthsBack,
  setMonthsBack,
  stats,
  loadingStats,
  merchantCategories,
  tagReports,
  activeReportId,
  setActiveReportId,
  handleSelectReport,
  handleSaveReport,
  handleDeleteReport,
  transactions,
  isLoadingTransactions,
  isLoadingMore,
  hasMore,
  loadMore,
  error,
  page,
  updateTransaction,
  addTransactionTag,
  removeTransactionTag,
  createAndAddTag,
}: {
  tags: Tag[];
  loadingTags: boolean;
  includedTagIds: number[];
  setIncludedTagIds: (ids: number[]) => void;
  omittedTagIds: number[];
  setOmittedTagIds: (ids: number[]) => void;
  monthsBack: number;
  setMonthsBack: (value: number) => void;
  stats: TagSpendStats[];
  loadingStats: boolean;
  merchantCategories: MerchantCategory[];
  tagReports: TagReport[];
  activeReportId: number | null;
  setActiveReportId: (id: number | null) => void;
  handleSelectReport: (report: TagReport) => void;
  handleSaveReport: (name: string) => void;
  handleDeleteReport: (id: number) => void;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
  page: Page;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
  addTransactionTag: (transactionId: number, tagId: number) => void;
  removeTransactionTag: (transactionId: number, transactionTagId: number) => void;
  createAndAddTag: (transactionId: number, name: string) => Promise<void>;
}) {
  const hasSelection = includedTagIds.length > 0 || omittedTagIds.length > 0;

  return (
    <div className="h-full flex flex-col gap-6">
      <FilterCard
        tags={tags}
        includedTagIds={includedTagIds}
        omittedTagIds={omittedTagIds}
        onIncludeChange={(ids) => { setActiveReportId(null); setIncludedTagIds(ids); }}
        onOmitChange={(ids) => { setActiveReportId(null); setOmittedTagIds(ids); }}
        monthsBack={monthsBack}
        onMonthsBackChange={setMonthsBack}
        tagReports={tagReports}
        activeReportId={activeReportId}
        onSelectReport={handleSelectReport}
        onSaveReport={handleSaveReport}
        onDeleteReport={handleDeleteReport}
        canSave={hasSelection}
      />

      <ChartCard
        loadingTags={loadingTags}
        loadingStats={loadingStats}
        hasSelection={hasSelection}
        stats={stats}
        allTags={tags}
        monthsBack={monthsBack}
      />

      {hasSelection && (
        <TransactionsCard
          transactions={transactions}
          isLoading={isLoadingTransactions}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
          error={error}
          page={page}
          updateTransaction={updateTransaction}
          merchantCategories={merchantCategories}
          allTags={tags}
          addTransactionTag={addTransactionTag}
          removeTransactionTag={removeTransactionTag}
          createAndAddTag={createAndAddTag}
        />
      )}
    </div>
  );
}
