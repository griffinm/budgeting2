import { Button, Input } from "@mantine/core";
import { useState } from "react";

export function EditableLabel({
  id,
  value,
  onSave,
}: {
  id: number;
  value: string;
  onSave: (id: number, value: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const onSubmit = () => {
    onSave(id, newValue);
    setIsEditing(false);
  }

  return (
    <div className="cursor-pointer hover:bg-gray-100 rounded-md p-1" onClick={() => !isEditing && setIsEditing(true)}>
      {isEditing ? (
        <form onSubmit={onSubmit} className="flex flex-row gap-2">
          <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}