import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { urls } from "@/utils/urls";
import { Breadcrumbs, Card } from "@mantine/core";
import { Merchant, MerchantCategory, Tag, Transaction } from "@/utils/types";
import { getTransaction, TransactionUpdateParams } from "@/api/transaction-client";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { fetchMerchantCategories } from "@/api/merchant-categories-client";
import { fetchTags } from "@/api/tags-client";
import { createTransactionTag, deleteTransactionTag } from "@/api/transaction-tags-client";
import { PendingTransaction } from "./PendingTransaction";
import { DetailsCard } from "./DetailsCard";
import { TransactionNote } from "./TransactionNote";
import { TransactionHeader } from "./TransactionHeader";
import { MerchantDefaultTagsCard } from "./MerchantDefaultTagsCard";

interface TransactionViewProps {
    transaction: Transaction;
    setTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

export function TransactionView({ transaction, setTransaction, updateTransaction }: TransactionViewProps) {
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchMerchantCategories().then(setMerchantCategories);
    fetchTags().then(setAllTags);
  }, []);

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
        />

        {transaction.pending && <PendingTransaction />}

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

        <Card>
          <MerchantDefaultTagsCard
            merchant={merchant}
            allTags={allTags}
            onMerchantUpdated={handleMerchantUpdated}
            onTagCreated={handleTagCreated}
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
    </div>
  );
}
