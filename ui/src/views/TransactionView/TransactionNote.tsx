import { TransactionUpdateParams } from "@/api/transaction-client";
import { Transaction } from "@/utils/types";
import { Button } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useEffect } from "react";

interface TransactionNoteProps {
  transaction: Transaction;
  updateTransaction: (id: number, params: TransactionUpdateParams) => void;
}

export function TransactionNote({
  transaction,
  updateTransaction,
}: TransactionNoteProps) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Note</h2>
      <NoteEditor
        note={transaction.note || ""}
        onSave={(note) => updateTransaction(transaction.id, { note })}
      />
    </>
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
        className="text-sm cursor-pointer hover:text-gray-100 min-h-[32px] flex items-center"
        onClick={() => setEditing(true)}
      >
        {note || <span className="text-gray-400 italic">Click to add a note...</span>}
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(value);
    setEditing(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-row sm:flex-col gap-2">
      <textarea
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        autoFocus
      />

      <div className="flex flex-row justify-end gap-1">
        <Button
          variant="outline"
          leftSection={<IconX size={16} />}
          onClick={() => {
            setValue(note);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          leftSection={<IconCheck size={16} />}
        >
          Save
        </Button>
      </div>
    </form>
  );
}