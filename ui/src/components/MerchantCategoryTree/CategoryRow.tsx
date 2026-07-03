import { useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "@mantine/core";
import { IconChevronRight, IconGripVertical } from "@tabler/icons-react";
import classNames from "classnames";
import { MerchantCategory } from "@/utils/types";
import { urls } from "@/utils/urls";
import { Budget } from "./Budget";
import { InlineBudget } from "./InlineBudget";
import { RowActions } from "./RowActions";

// Visual nesting is capped: anything deeper renders at MAX_DEPTH's indent.
const MAX_DEPTH = 2;

export interface CategoryHandlers {
  onEdit: (category: MerchantCategory) => void;
  onViewTransactions: (category: MerchantCategory) => void;
  onDelete: (category: MerchantCategory) => void;
  onSaveBudget: (category: MerchantCategory, targetBudget: number | null) => void;
}

// HTML5 drag-and-drop can't expose the payload during dragover, so the
// dragged id lives in shared state owned by the View.
export interface CategoryDnd {
  draggingId: number | null;
  startDrag: (category: MerchantCategory) => void;
  endDrag: () => void;
  canDropOn: (targetId: number | null) => boolean;
  dropOn: (targetId: number | null) => void;
}

export function CategoryRow({
  category,
  depth,
  monthsMultiplier,
  handlers,
  dnd,
}: {
  category: MerchantCategory;
  depth: number;
  monthsMultiplier: number;
  handlers: CategoryHandlers;
  dnd: CategoryDnd;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = category.children.length > 0;
  const indent = 12 + depth * 24;
  const droppable = dnd.draggingId !== null && dnd.canDropOn(category.id);

  return (
    <>
      <div
        className={classNames(
          "group flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 py-1.5 pr-2 sm:pr-3 border-t border-gray-100 dark:border-[var(--mantine-color-dark-5)] transition-colors",
          {
            "hover:bg-gray-50 dark:hover:bg-[var(--mantine-color-dark-6)]": !dragOver,
            "bg-primary-0 ring-1 ring-inset ring-primary-400 dark:bg-[var(--mantine-color-dark-5)]":
              dragOver && droppable,
            "cursor-pointer": hasChildren,
          },
        )}
        style={{ paddingLeft: indent }}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
        onDragOver={(e) => {
          if (droppable) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (droppable) dnd.dropOn(category.id);
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 order-1">
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(category.id));
              dnd.startDrag(category);
            }}
            onDragEnd={dnd.endDrag}
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:block shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
          >
            <IconGripVertical size={14} />
          </div>
          {hasChildren ? (
            <IconChevronRight
              size={16}
              className="shrink-0 text-gray-400"
              style={{
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
              }}
            />
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: `#${category.color}` }}
          />
          <Link
            to={urls.merchantCategory.path(category.id)}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium truncate hover:underline"
          >
            {category.name}
          </Link>
          {hasChildren && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {category.children.length}
            </span>
          )}
        </div>

        <div className="order-2 sm:order-3 ml-auto sm:ml-0 shrink-0">
          <RowActions
            category={category}
            onEdit={handlers.onEdit}
            onViewTransactions={handlers.onViewTransactions}
            onDelete={handlers.onDelete}
          />
        </div>

        <div className="order-3 sm:order-2 basis-full sm:basis-[280px] sm:ml-auto shrink-0 flex items-center">
          {category.isLeaf ? (
            <InlineBudget
              category={category}
              monthsMultiplier={monthsMultiplier}
              onSave={(targetBudget) => handlers.onSaveBudget(category, targetBudget)}
            />
          ) : (
            <Tooltip label="Sum of subcategory budgets" withArrow openDelay={300}>
              <div className="w-full">
                <Budget merchantCategory={category} monthsMultiplier={monthsMultiplier} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {expanded &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={Math.min(depth + 1, MAX_DEPTH)}
            monthsMultiplier={monthsMultiplier}
            handlers={handlers}
            dnd={dnd}
          />
        ))}
    </>
  );
}
