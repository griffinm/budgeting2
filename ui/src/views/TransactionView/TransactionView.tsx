import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urls } from "@/utils/urls";
import { Breadcrumbs, Button, Card } from "@mantine/core";
import { IconArrowsSplit } from "@tabler/icons-react";
import { Merchant, MerchantCategory, Tag, Transaction } from "@/utils/types";
import { getTransaction, unsplitTransaction, TransactionUpdateParams } from "@/api/transaction-client";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { fetchMerchantCategories } from "@/api/merchant-categories-client";
import { fetchTags } from "@/api/tags-client";
import { createTransactionTag, deleteTransactionTag } from "@/api/transaction-tags-client";
import { NotificationContext } from "@/providers/Notification/NotificationContext";
import { PendingTransaction } from "./PendingTransaction";
import { DetailsCard } from "./DetailsCard";
import { TransactionNote } from "./TransactionNote";
import { TransactionHeader } from "./TransactionHeader";
import { SplitTransactionModal } from "./SplitTransactionModal";
import { SplitChildrenCard } from "./SplitChildrenCard";
import { SplitParentBanner } from "./SplitParentBanner";

interface TransactionViewProps {
    transaction: Transaction;
    setTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

export function TransactionView({ transaction, setTransaction, updateTransaction }: TransactionViewProps) {
  const { showNotification } = useContext(NotificationContext);
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [splitModalOpened, setSplitModalOpened] = useState(false);

  useEffect(() => {
    fetchMerchantCategories().then(setMerchantCategories);
    fetchTags().then(setAllTags);
  }, []);

  // Pending transactions can't be split (Plaid replaces them on posting),
  // and splits are single-level (a child can't be split again).
  const canSplit = !transaction.pending && !transaction.parentTransactionId;

  const handleUnsplit = () => {
    unsplitTransaction({ id: transaction.id })
      .then((updated) => {
        setTransaction(updated);
        showNotification({ title: 'Split removed', message: 'The original transaction was restored.', type: 'success' });
      })
      .catch((error) => {
        const errors = error.response?.data?.errors;
        showNotification({
          title: 'Error',
          message: Array.isArray(errors) ? errors.join(' ') : 'Failed to unsplit transaction.',
          type: 'error',
        });
      });
  };

  const addTransactionTag = (transactionId: number, tagId: number) => {
    createTransactionTag({ plaidTransactionId: transactionId, tagId }).then((newTag) => {
      setTransaction({ ...transaction, transactionTags: [...transaction.transactionTags, newTag] });
    });
  };

  const removeTransactionTag = (_transactionId: number, transactionTagId: number) => {
    deleteTransactionTag({ id: transactionTagId }).then(() => {
      setTransaction({
        ...transaction,
        transactionTags: transaction.transactionTags.filter((t) => t.id !== transactionTagId),
      });
    });
  };

  const createAndAddTag = () => {
    getTransaction({ id: transaction.id }).then(setTransaction);
  };

  const handleMerchantUpdated = (updatedMerchant: Merchant) => {
    setTransaction({ ...transaction, merchant: updatedMerchant });
  };

  const handleTagCreated = (newTag: Tag) => {
    setAllTags((prev) => [...prev, newTag]);
  };

  const merchant = transaction.merchant;
  const plaidAccount = transaction.plaidAccount;

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.transactions.path()}>Transactions</Link>
        <span>{merchantDisplayName(merchant)}</span>
      </Breadcrumbs>

      <div className="flex flex-col gap-4">

        <TransactionHeader
          transaction={transaction}
          merchant={merchant}
          allTags={allTags}
          onMerchantUpdated={handleMerchantUpdated}
          onTagCreated={handleTagCreated}
          actions={canSplit && !transaction.split && (
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconArrowsSplit className="w-4 h-4" />}
              onClick={() => setSplitModalOpened(true)}
            >
              Split
            </Button>
          )}
        />

        {transaction.pending && <PendingTransaction />}

        {transaction.parentTransaction && <SplitParentBanner parent={transaction.parentTransaction} />}

        {transaction.split && (
          <SplitChildrenCard
            transaction={transaction}
            onEditSplit={() => setSplitModalOpened(true)}
            onUnsplit={handleUnsplit}
          />
        )}

        <Card>
          <DetailsCard
            transaction={transaction}
            merchant={merchant}
            plaidAccount={plaidAccount}
            merchantCategories={merchantCategories}
            allTags={allTags}
            updateTransaction={updateTransaction}
            onAddTag={addTransactionTag}
            onRemoveTag={removeTransactionTag}
            onCreateAndAddTag={createAndAddTag}
          />
        </Card>

        {/* Note card */}
        <Card>
          <TransactionNote
            transaction={transaction}
            updateTransaction={updateTransaction}
          />
        </Card>
      </div>

      <SplitTransactionModal
        transaction={transaction}
        merchantCategories={merchantCategories}
        opened={splitModalOpened}
        onClose={() => setSplitModalOpened(false)}
        onSplit={setTransaction}
      />
    </div>
  );
}
