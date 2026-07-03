import { MerchantCategory } from "@/utils/types";
import { Button, Checkbox, Modal } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCornerDownLeft,
  IconChevronRight,
  IconSearch,
  IconArrowsVertical,
} from "@tabler/icons-react";
import classNames from "classnames";
import {
  categoryParentPath,
  fullyQualifiedCategoryName,
  formatMerchantCategoriesAsTree,
} from "@/utils/merchantCategoryUtils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const h = (hex || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(120,120,120,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// The chain of ancestor ids for a category, nearest parent first.
function ancestorIds(
  category: MerchantCategory,
  all: MerchantCategory[],
): number[] {
  const ids: number[] = [];
  let parentId = category.parentMerchantTagId;
  // Guard against cycles with a visited set.
  const seen = new Set<number>();
  while (parentId != null && !seen.has(parentId)) {
    seen.add(parentId);
    ids.push(parentId);
    const parent = all.find((c) => c.id === parentId);
    parentId = parent ? parent.parentMerchantTagId : null;
  }
  return ids;
}

// A single row in the flattened, currently-visible tree.
interface FlatRow {
  category: MerchantCategory;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  // For each ancestor column, whether that ancestor has a following sibling
  // (i.e. whether to keep drawing its vertical guide rail through this row).
  ancestorHasNext: boolean[];
}

function flattenTree(
  nodes: MerchantCategory[],
  expanded: Set<number>,
  depth: number,
  ancestorHasNext: boolean[],
  out: FlatRow[],
): FlatRow[] {
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    out.push({ category: node, depth, hasChildren, expanded: isExpanded, ancestorHasNext });
    if (hasChildren && isExpanded) {
      flattenTree(node.children, expanded, depth + 1, [...ancestorHasNext, !isLast], out);
    }
  });
  return out;
}

// Split a label so the matched query substring can be emphasised.
function highlight(label: string, query: string) {
  if (!query) return label;
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-primary-100 dark:bg-primary-900/60 text-inherit rounded-[2px] px-0.5">
        {label.slice(idx, idx + query.length)}
      </mark>
      {label.slice(idx + query.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryEdit({
  currentValue,
  onCancel,
  onSave,
  allCategories,
  opened,
  onClose,
}: {
  currentValue?: MerchantCategory | null;
  onCancel: () => void;
  onSave: ({ id, useDefaultCategory }: { id: number; useDefaultCategory: boolean }) => void;
  allCategories: MerchantCategory[];
  opened: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<MerchantCategory | null>(currentValue || null);
  const [filter, setFilter] = useState("");
  const [useDefaultCategory, setUseDefaultCategory] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const tree = useMemo(
    () => formatMerchantCategoriesAsTree({ merchantCategories: [...allCategories] }),
    [allCategories],
  );

  const searching = filter.trim().length > 0;

  // Rows to render + navigate. In browse mode this is the visible tree; while
  // searching it collapses to a flat list of path matches.
  const rows: FlatRow[] = useMemo(() => {
    if (searching) {
      const q = filter.trim().toLowerCase();
      return allCategories
        .filter((c) => fullyQualifiedCategoryName(c, allCategories).toLowerCase().includes(q))
        .sort((a, b) =>
          fullyQualifiedCategoryName(a, allCategories).localeCompare(
            fullyQualifiedCategoryName(b, allCategories),
          ),
        )
        .map((category) => ({
          category,
          depth: 0,
          hasChildren: false,
          expanded: false,
          ancestorHasNext: [],
        }));
    }
    return flattenTree(tree, expanded, 0, [], []);
  }, [searching, filter, allCategories, tree, expanded]);

  // On open: seed selection from the current value, expand the path down to it,
  // reset the filter, and focus the search box.
  useEffect(() => {
    if (!opened) return;
    setSelected(currentValue || null);
    setUseDefaultCategory(false);
    setFilter("");
    setExpanded(currentValue ? new Set(ancestorIds(currentValue, allCategories)) : new Set());
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [opened, currentValue, allCategories]);

  // Keep the keyboard cursor pointed at the selected row (or the top).
  useEffect(() => {
    const idx = rows.findIndex((r) => r.category.id === selected?.id);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [rows, selected?.id]);

  // Scroll the active row into view as the cursor moves.
  useEffect(() => {
    const active = rows[activeIndex];
    if (!active) return;
    rowRefs.current.get(active.category.id)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, rows]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const commit = (category: MerchantCategory | null) => {
    if (!category) return;
    onSave({ id: category.id, useDefaultCategory });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (rows.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "ArrowRight": {
        if (searching) break;
        const row = rows[activeIndex];
        if (row?.hasChildren && !row.expanded) {
          e.preventDefault();
          toggle(row.category.id);
        } else if (row?.hasChildren) {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
        }
        break;
      }
      case "ArrowLeft": {
        if (searching) break;
        const row = rows[activeIndex];
        if (row?.hasChildren && row.expanded) {
          e.preventDefault();
          toggle(row.category.id);
        } else if (row) {
          const parentIdx = rows.findIndex(
            (r) => r.category.id === row.category.parentMerchantTagId,
          );
          if (parentIdx >= 0) {
            e.preventDefault();
            setActiveIndex(parentIdx);
          }
        }
        break;
      }
      case "Enter": {
        e.preventDefault();
        const row = rows[activeIndex];
        if (row) {
          setSelected(row.category);
          commit(row.category);
        }
        break;
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select a category"
      centered
      size="lg"
      radius="md"
      overlayProps={{ backgroundOpacity: 0.55, blur: 2 }}
    >
      <div
        className="flex flex-col h-[460px] -mt-1"
        onKeyDown={onKeyDown}
      >
        {/* Search */}
        <div className="relative mb-3">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            ref={searchRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-[var(--mantine-color-dark-7)] border border-gray-200 dark:border-[var(--mantine-color-dark-4)] outline-none transition-colors focus:border-primary-400 focus:bg-white dark:focus:bg-[var(--mantine-color-dark-6)] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-[var(--mantine-color-dark-4)] bg-white dark:bg-[var(--mantine-color-dark-7)] py-1"
        >
          {rows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-1 text-center px-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No categories match “{filter.trim()}”
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Try a different search term.
              </div>
            </div>
          ) : (
            rows.map((row, i) => (
              <Row
                key={row.category.id}
                row={row}
                allCategories={allCategories}
                searching={searching}
                query={filter.trim()}
                selected={selected?.id === row.category.id}
                active={i === activeIndex}
                isCurrent={currentValue?.id === row.category.id}
                onHover={() => setActiveIndex(i)}
                onSelect={() => setSelected(row.category)}
                onCommit={() => {
                  setSelected(row.category);
                  commit(row.category);
                }}
                onToggle={() => toggle(row.category.id)}
                registerRef={(el) => {
                  if (el) rowRefs.current.set(row.category.id, el);
                  else rowRefs.current.delete(row.category.id);
                }}
              />
            ))
          )}
        </div>

        {/* Selected preview */}
        <div className="mt-3 flex items-center gap-2 min-h-[24px] text-sm">
          {selected ? (
            <>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">
                Selected
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: `#${selected.color}` }}
              />
              <span className="min-w-0 truncate">
                {categoryParentPath(selected, allCategories) && (
                  <span className="text-gray-400 dark:text-gray-500">
                    {categoryParentPath(selected, allCategories)}
                    <span className="mx-1 opacity-60">/</span>
                  </span>
                )}
                <span className="font-semibold">{selected.name}</span>
              </span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic text-xs">
              No category selected
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[var(--mantine-color-dark-4)] flex items-center justify-between">
          <Checkbox
            size="sm"
            label="Make default for merchant"
            checked={useDefaultCategory}
            onChange={(e) => setUseDefaultCategory(e.target.checked)}
          />
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <IconArrowsVertical size={13} />
              navigate
              <IconCornerDownLeft size={13} className="ml-1.5" />
              select
            </span>
            <div className="flex gap-2">
              <Button variant="subtle" size="xs" color="gray" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                size="xs"
                disabled={!selected}
                onClick={() => commit(selected)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

function Row({
  row,
  allCategories,
  searching,
  query,
  selected,
  active,
  isCurrent,
  onHover,
  onSelect,
  onCommit,
  onToggle,
  registerRef,
}: {
  row: FlatRow;
  allCategories: MerchantCategory[];
  searching: boolean;
  query: string;
  selected: boolean;
  active: boolean;
  isCurrent: boolean;
  onHover: () => void;
  onSelect: () => void;
  onCommit: () => void;
  onToggle: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}) {
  const { category, hasChildren, expanded, ancestorHasNext } = row;
  const color = `#${category.color}`;
  const parentPath = searching ? categoryParentPath(category, allCategories) : "";

  return (
    <div
      ref={registerRef}
      onMouseMove={onHover}
      onClick={onSelect}
      onDoubleClick={onCommit}
      className={classNames(
        "group relative flex items-stretch cursor-pointer select-none transition-colors",
        {
          "bg-gray-50 dark:bg-[var(--mantine-color-dark-6)]": active && !selected,
        },
      )}
      style={
        selected
          ? { backgroundColor: hexToRgba(category.color, 0.14) }
          : undefined
      }
    >
      {/* Color accent bar for the selected row */}
      {selected && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Indentation rails (browse mode only) */}
      {!searching &&
        ancestorHasNext.map((hasNext, i) => (
          <span
            key={i}
            className={classNames("w-5 shrink-0 self-stretch", {
              "border-l border-gray-200 dark:border-[var(--mantine-color-dark-4)]": hasNext,
            })}
          />
        ))}

      <div className="flex items-center gap-2 min-w-0 flex-1 py-1.5 pr-3">
        {/* Chevron / spacer */}
        {!searching &&
          (hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[var(--mantine-color-dark-5)] transition-colors"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <IconChevronRight
                size={15}
                style={{
                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 180ms ease",
                }}
              />
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          ))}

        {/* Color dot */}
        <span
          className={classNames("shrink-0 rounded-full", searching ? "w-2.5 h-2.5" : "w-2.5 h-2.5")}
          style={{ backgroundColor: color }}
        />

        {/* Label */}
        <div className="min-w-0 flex-1">
          {parentPath && (
            <div className="text-[11px] leading-tight text-gray-400 dark:text-gray-500 truncate">
              {parentPath}
            </div>
          )}
          <div
            className={classNames("text-sm truncate leading-tight", {
              "font-semibold": selected || (!searching && hasChildren),
              "text-gray-700 dark:text-gray-200": !selected,
            })}
          >
            {highlight(category.name, query)}
          </div>
        </div>

        {/* Trailing meta */}
        {isCurrent && (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[var(--mantine-color-dark-5)] text-gray-500 dark:text-gray-400">
            Current
          </span>
        )}
        {!searching && hasChildren && !isCurrent && (
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {category.children.length}
          </span>
        )}
      </div>
    </div>
  );
}
