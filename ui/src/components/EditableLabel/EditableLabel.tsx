import { Button, Input } from "@mantine/core";
import { useState } from "react";
import { Link } from "react-router-dom";

export function EditableLabel({
  id,
  value,
  onSave,
  linkValue,
}: {
  id: number;
  value: string;
  linkValue?: string;
  onSave: (id: number, value: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const onSubmit = () => {
    onSave(id, newValue);
    setIsEditing(false);
  }

  return (
    <div className="rounded-md p-1">
      {isEditing ? (
        <form onSubmit={onSubmit} className="flex flex-row gap-2">
          <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <div className="flex flex-row gap-2">
          {linkValue ? <Link to={linkValue}>{value}</Link> : <span>{value}</span>}
          <div className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setIsEditing(true)}>✎</div>
        </div>
      )}
    </div>
  );
}