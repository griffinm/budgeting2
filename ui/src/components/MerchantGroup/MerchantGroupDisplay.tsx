import { MerchantGroup } from "@/utils/types";
import { useState } from "react";
import { MerchantGroupEdit } from "./MerchantGroupEdit";

export function MerchantGroupDisplay({
  group,
  onSave,
  allGroups,
  onGroupCreated,
  merchantId,
}: {
  group?: MerchantGroup | null;
  onSave: (groupId: number | null) => void;
  allGroups: MerchantGroup[];
  onGroupCreated?: (group: MerchantGroup) => void;
  merchantId: number;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (groupId: number | null) => {
    onSave(groupId);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div 
        className="cursor-pointer hover:bg-gray-100 rounded-md p-1 transition-colors flex flex-col"
        onClick={() => setIsEditing(true)}
      >
        {group ? (
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-700">
              {group.name}
            </div>
            {group.description && (
              <div className="text-xs text-gray-500">
                {group.description}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            No group
          </div>
        )}
      </div>

      <MerchantGroupEdit
        currentValue={group}
        onCancel={handleCancel}
        onSave={handleSave}
        allGroups={allGroups}
        opened={isEditing}
        onClose={handleCancel}
        onGroupCreated={onGroupCreated}
        merchantId={merchantId}
      />
    </>
  );
}
