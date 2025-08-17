import { Button, Input } from "@mantine/core";
import classNames from "classnames";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";

export function EditableLabel({
  id,
  value,
  onSave,
  linkValue,
  component,
  additionalClasses,
}: {
  id: number;
  value: string;
  linkValue?: string;
  onSave: (id: number, value: string) => Promise<void>;
  component?: string;
  additionalClasses?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);
  const displayClasses = classNames('text-gray-500 hover:text-gray-700 cursor-pointer');
  
  // Default to 'div' if no component is specified
  const ComponentType = component || 'div';

  const onSubmit = () => {
    onSave(id, newValue);
    setIsEditing(false);
  }

  const renderComponent = () => {
    // Combine default classes with additional classes
    const combinedClasses = classNames(displayClasses, additionalClasses);
    const props = { className: combinedClasses };
    return React.createElement(ComponentType, props, value);
  };

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
          {linkValue ? (
            <Link to={linkValue}>
              {renderComponent()}
            </Link>
          ) : (
            renderComponent()
          )}
          <div className={displayClasses} onClick={() => setIsEditing(true)}>✎</div>
        </div>
      )}
    </div>
  );
}