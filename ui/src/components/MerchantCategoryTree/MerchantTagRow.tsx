import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { IconEye, IconPencil } from "@tabler/icons-react";
import { MerchantTag } from "@/utils/types";
import { urls } from "@/utils/urls";
import { Budget } from "./Budget";
import classNames from "classnames";

export function MerchantTagRow({ 
  tag, 
  expandedLevel = 0,
  onViewTransactions,
}: { 
  tag: MerchantTag; 
  expandedLevel?: number; 
  onViewTransactions: (merchantTag: MerchantTag) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = tag.children && tag.children.length > 0;
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  
  const rowClasses = classNames('mr-2', {
    'ml-[25px]': expandedLevel === 1,
    'ml-[50px]': expandedLevel === 2,
    'ml-[75px]': expandedLevel === 3,
    'ml-[100px]': expandedLevel === 4,
    'ml-[125px]': expandedLevel === 5,
    'ml-[150px]': expandedLevel === 6,
    'ml-[175px]': expandedLevel === 7,
  });
  
  return (
    <div className="w-full flex flex-col hover:bg-gray-100 transition-colors">
      <div className="flex flex-row w-full border-b border-gray-200 py-2 items-center">
        <div className="flex flex-col w-1/3">
          <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-2">
            {!hasChildren && (
              <span style={{ width: `${(expandedLevel * 25) + 27}px` }}></span>
            )}
            {hasChildren && (expanded ? (
              <span
                className={classNames("cursor-pointer", rowClasses)}
                onClick={() => setExpanded(!expanded)}
              >
                ▼
              </span>
            ) : (
              <span
                className={classNames("cursor-pointer", rowClasses)}
                onClick={() => setExpanded(!expanded)}>
                  ▶
              </span>
            ))}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: `#${tag.color}`,
                }}
              >
              </div>
              <div>
                <Link to={urls.merchantTag.path(tag.id)}>{tag.name}</Link>
              </div>
          </div>
        </div>

        <div className="flex flex-col w-1/3">
          <Budget merchantTag={tag} />
        </div>

        <div className="flex flex-row w-1/3 gap-2 justify-end">
          <EditBudgetButton merchantTag={tag} onClick={() => setIsEditingBudget(true)} isEditing={isEditingBudget} />
          <Button size="xs" variant="subtle" onClick={() => onViewTransactions(tag)}>
            <IconEye size={16} />
            View Transactions
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          {tag.children?.map((child) => (
            <MerchantTagRow
              key={child.id}
              tag={child}
              expandedLevel={expandedLevel + 1}
              onViewTransactions={(merchantTag) => onViewTransactions(merchantTag)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function EditBudgetButton({
  merchantTag,
  onClick,
  isEditing,
}: {
  merchantTag: MerchantTag;
  onClick: (merchantTag: MerchantTag) => void;
  isEditing: boolean;
}) {
  if (!merchantTag.isLeaf) {
    return null;
  }

  if (isEditing) {
    return null;
  }

  return (
    <Button variant="subtle" size="xs" onClick={() => onClick(merchantTag)}>
      <IconPencil size={16} />
      Edit Budget
    </Button>
  );
}
