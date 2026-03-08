import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks";
import { urls } from "@/utils/urls";
import { Loading } from "@/components/Loading";
import { Badge, Breadcrumbs, Card } from "@mantine/core";
import { MerchantTag, Tag, Transaction } from "@/utils/types";
import { getTransaction, updateTransaction as updateTransactionApi } from "@/api/transaction-client";
import { TransactionUpdateParams } from "@/api/transaction-client";
import { TransactionAmount } from "@/components/TransactionAmount/TransactionAmount";
import { CategoryDisplay } from "@/components/Category/CategoryDisplay";
import { TransactionType } from "@/components/TransactionType/TransactionType";
import { TransactionTags } from "@/components/TransactionTags/TransactionTags";
import { Logo } from "@/components/TransactionsTable/Logo";
import { merchantDisplayName } from "@/utils/merchantsUtils";
import { fetchMerchantTags } from "@/api/merchant-tags-client";
import { fetchTags } from "@/api/tags-client";
import { createTransactionTag, deleteTransactionTag } from "@/api/transaction-tags-client";
import { format } from "date-fns";

export default function TransactionPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchantTags, setMerchantTags] = useState<MerchantTag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const setTitle = usePageTitle();

  useEffect(() => {
    if (transaction) {
      setTitle(`${merchantDisplayName(transaction.merchant)} - ${format(new Date(transaction.date), "MMM d, yyyy")} | Budgeting`);
    }
  }, [setTitle, transaction]);

  useEffect(() => {
    setLoading(true);
    getTransaction({ id: Number(id) })
      .then(setTransaction)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchMerchantTags().then(setMerchantTags);
    fetchTags().then(setAllTags);
  }, []);

  const updateTransaction = (transactionId: number, params: TransactionUpdateParams) => {
    updateTransactionApi({ id: transactionId, params }).then(setTransaction);
  };

  const addTransactionTag = (transactionId: number, tagId: number) => {
    createTransactionTag({ plaidTransactionId: transactionId, tagId }).then((newTag) => {
      setTransaction((prev) =>
        prev ? { ...prev, transactionTags: [...prev.transactionTags, newTag] } : prev
      );
    });
  };

  const removeTransactionTag = (_transactionId: number, transactionTagId: number) => {
    deleteTransactionTag({ id: transactionTagId }).then(() => {
      setTransaction((prev) =>
        prev
          ? { ...prev, transactionTags: prev.transactionTags.filter((t) => t.id !== transactionTagId) }
          : prev
      );
    });
  };

  const createAndAddTag = (_transactionId: number, _name: string) => {
    // Tags are created via the tags API then added; for now just refetch
    getTransaction({ id: Number(id) }).then(setTransaction);
  };

  if (loading || !transaction) {
    return <Loading />;
  }

  const merchant = transaction.merchant;
  const plaidAccount = transaction.plaidAccount;

  return (
    <div>
      <Breadcrumbs className="mb-4">
        <Link to={urls.transactions.path()}>Transactions</Link>
        <span>{merchantDisplayName(merchant)}</span>
      </Breadcrumbs>

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-[48px] w-[48px] flex-shrink-0">
            <Logo merchant={merchant} isCheck={transaction.isCheck} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <Link to={urls.merchant.path(merchant.id)}>
                {merchantDisplayName(merchant)}
              </Link>
            </h1>
            <span className="text-sm text-gray-500">
              {format(new Date(transaction.date), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="ml-auto">
            <div className="text-3xl">
              <TransactionAmount amount={transaction.amount} />
            </div>
          </div>
        </div>

        {/* Details card */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Account">
              <span>{plaidAccount.nickname || plaidAccount.plaidOfficialName}</span>
            </DetailRow>

            <DetailRow label="Date">
              <span>{format(new Date(transaction.date), "MMMM d, yyyy")}</span>
            </DetailRow>

            {transaction.authorizedAt && (
              <DetailRow label="Authorized">
                <span>{format(new Date(transaction.authorizedAt), "MMMM d, yyyy")}</span>
              </DetailRow>
            )}

            <DetailRow label="Type">
              <TransactionType
                transaction={transaction}
                onSave={(txId, transactionType) =>
                  updateTransaction(txId, {
                    transactionType,
                    useAsDefault: false,
                    merchantId: merchant.id,
                  })
                }
              />
            </DetailRow>

            <DetailRow label="Category">
              <CategoryDisplay
                category={transaction.merchantTag}
                onSave={({ id, useDefaultCategory }) => {
                  updateTransaction(transaction.id, {
                    merchantTagId: id,
                    useAsDefault: useDefaultCategory,
                    merchantId: merchant.id,
                  });
                }}
                allCategories={merchantTags}
              />
            </DetailRow>

            <DetailRow label="Status">
              {transaction.pending ? (
                <Badge color="yellow" variant="light">Pending</Badge>
              ) : (
                <Badge color="green" variant="light">Posted</Badge>
              )}
            </DetailRow>

            {transaction.paymentChannel && (
              <DetailRow label="Payment Channel">
                <span className="capitalize">{transaction.paymentChannel}</span>
              </DetailRow>
            )}

            {transaction.checkNumber && (
              <DetailRow label="Check Number">
                <span>{transaction.checkNumber}</span>
              </DetailRow>
            )}

            {transaction.recurring && (
              <DetailRow label="Recurring">
                <Badge color="blue" variant="light">Recurring</Badge>
              </DetailRow>
            )}

            {transaction.categoryPrimary && (
              <DetailRow label="Plaid Category">
                <span>
                  {transaction.categoryPrimary}
                  {transaction.categoryDetail && ` > ${transaction.categoryDetail}`}
                </span>
              </DetailRow>
            )}
          </div>
        </Card>

        {/* Tags card */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <TransactionTags
            transaction={transaction}
            allTags={allTags}
            onAdd={addTransactionTag}
            onRemove={removeTransactionTag}
            onCreateAndAdd={createAndAddTag}
          />
        </Card>

        {/* Note card */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Note</h2>
          <NoteEditor
            note={transaction.note || ""}
            onSave={(note) => updateTransaction(transaction.id, { note })}
          />
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function NoteEditor({ note, onSave }: { note: string; onSave: (note: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note);

  useEffect(() => {
    setValue(note);
  }, [note]);

  if (!editing) {
    return (
      <div
        className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 min-h-[32px] flex items-center"
        onClick={() => setEditing(true)}
      >
        {note || <span className="text-gray-400 italic">Click to add a note...</span>}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <textarea
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        autoFocus
      />
      <div className="flex flex-col gap-1">
        <button
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            onSave(value);
            setEditing(false);
          }}
        >
          Save
        </button>
        <button
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => {
            setValue(note);
            setEditing(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
