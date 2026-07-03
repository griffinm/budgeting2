import { useState } from "react";
import { Link } from "react-router-dom";
import { Collapse, Paper } from "@mantine/core";
import { IconChevronRight, IconGripVertical } from "@tabler/icons-react";
import classNames from "classnames";
import { MerchantCategory } from "@/utils/types";
import { urls } from "@/utils/urls";
import { Budget } from "./Budget";
import { InlineBudget } from "./InlineBudget";
import { RowActions } from "./RowActions";
import { CategoryRow, CategoryDnd, CategoryHandlers } from "./CategoryRow";
import { TrendSparkline } from "./TrendSparkline";

export function CategoryCard({
  category,
  monthsMultiplier,
  sparklineData,
  defaultExpanded,
  handlers,
  dnd,
}: {
  category: MerchantCategory;
  monthsMultiplier: number;
  sparklineData: number[];
  defaultExpanded: boolean;
  handlers: CategoryHandlers;
  dnd: CategoryDnd;
}) {
  const hasChildren = category.children.length > 0;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [dragOver, setDragOver] = useState(false);
  const droppable = dnd.draggingId !== null && dnd.canDropOn(category.id);

  return (
    <Paper
      p={0}
      radius="md"
      shadow="sm"
      withBorder
      className={classNames("overflow-hidden transition-shadow", {
        "ring-1 ring-inset ring-primary-400": dragOver && droppable,
      })}
      style={{ borderLeft: `4px solid #${category.color}` }}
    >
      <div
        className={classNames(
          "flex flex-wrap sm:flex-nowrap items-center gap-x-2.5 gap-y-2 px-3 sm:px-4 py-3 select-none transition-colors",
          {
            "cursor-pointer hover:bg-gray-50 dark:hover:bg-[var(--mantine-color-dark-6)]":
              hasChildren,
          },
        )}
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
        <div className="flex items-center gap-2.5 min-w-0 flex-1 order-1">
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
            <IconGripVertical size={16} />
          </div>
          {hasChildren && (
            <IconChevronRight
              size={18}
              className="shrink-0 text-gray-400"
              style={{
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
              }}
            />
          )}
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: `#${category.color}` }}
          />
          <Link
            to={urls.merchantCategory.path(category.id)}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold truncate hover:underline"
          >
            {category.name}
          </Link>
          {hasChildren && (
            <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">
              {category.children.length}{" "}
              {category.children.length === 1 ? "subcategory" : "subcategories"}
            </span>
          )}
        </div>

        <div className="hidden lg:block order-2 shrink-0">
          <TrendSparkline data={sparklineData} color={`#${category.color}`} />
        </div>

        <div className="order-4 sm:order-3 basis-full sm:basis-[280px] shrink-0 flex items-center">
          {category.isLeaf ? (
            <InlineBudget
              category={category}
              monthsMultiplier={monthsMultiplier}
              onSave={(targetBudget) => handlers.onSaveBudget(category, targetBudget)}
            />
          ) : (
            <Budget merchantCategory={category} monthsMultiplier={monthsMultiplier} />
          )}
        </div>

        <div className="order-3 sm:order-4 ml-auto sm:ml-0 shrink-0">
          <RowActions
            category={category}
            onEdit={handlers.onEdit}
            onViewTransactions={handlers.onViewTransactions}
            onDelete={handlers.onDelete}
          />
        </div>
      </div>

      {hasChildren && (
        <Collapse in={expanded}>
          <div className="pb-1">
            {category.children.map((child) => (
              <CategoryRow
                key={child.id}
                category={child}
                depth={0}
                monthsMultiplier={monthsMultiplier}
                handlers={handlers}
                dnd={dnd}
              />
            ))}
          </div>
        </Collapse>
      )}
    </Paper>
  );
}
