import { MerchantCategory } from "./types";

export function totalSpendForChildren(merchantCategory: MerchantCategory): number {
  if (merchantCategory.isLeaf) {
    return Number(merchantCategory.totalTransactionAmount) || 0;
  }

  return merchantCategory.children.reduce((acc, child) => acc + totalSpendForChildren(child), 0);
}

export function totalBudgetForChildren(merchantCategory: MerchantCategory): number {
  if (merchantCategory.isLeaf) {
    return Number(merchantCategory.targetBudget) || 0;
  }

  return merchantCategory.children.reduce((acc, child) => acc + totalBudgetForChildren(child), 0);
}

export function formatMerchantCategoriesAsTree({ merchantCategories }: { merchantCategories: MerchantCategory[] }): MerchantCategory[] {
  if (!merchantCategories || merchantCategories.length === 0) {
    return [];
  }

  // Create a map to store all categories with their children initialized
  const categoryMap = new Map<number, MerchantCategory>();

  // First pass: Initialize all categories with empty children arrays
  merchantCategories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  // Second pass: Build the tree structure by assigning children to parents
  // This supports arbitrary nesting levels because we process all relationships
  const rootCategories: MerchantCategory[] = [];
  const sortedCategories = merchantCategories.sort((a, b) => a.name.localeCompare(b.name));

  sortedCategories.forEach(category => {
    const currentCategory = categoryMap.get(category.id);
    if (!currentCategory) return; // Safety check

    if (category.parentMerchantTagId === null || category.parentMerchantTagId === undefined) {
      // This is a root-level category
      rootCategories.push(currentCategory);
    } else {
      // This is a child category - find its parent and add it to parent's children
      const parentCategory = categoryMap.get(category.parentMerchantTagId);
      if (parentCategory) {
        parentCategory.children.push(currentCategory);
      } else {
        // Parent not found - treat as root (orphaned category)
        console.warn(`Parent category with ID ${category.parentMerchantTagId} not found for category "${category.name}". Treating as root category.`);
        rootCategories.push(currentCategory);
      }
    }
  });

  return rootCategories;
}

export function getDescendantIds(category: MerchantCategory): number[] {
  const ids: number[] = [category.id];
  for (const child of category.children) {
    ids.push(...getDescendantIds(child));
  }
  return ids;
}

export function findCategoryInTree(tree: MerchantCategory[], id: number): MerchantCategory | undefined {
  for (const category of tree) {
    if (category.id === id) {
      return category;
    }
    const found = findCategoryInTree(category.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function fullyQualifiedCategoryName(category: MerchantCategory, merchantCategories: MerchantCategory[]): string {
  if (category.parentMerchantTagId === null || category.parentMerchantTagId === undefined) {
    return category.name;
  }

  const parentCategory = merchantCategories.find(t => t.id === category.parentMerchantTagId);
  if (!parentCategory) {
    return category.name;
  }

  return `${fullyQualifiedCategoryName(parentCategory, merchantCategories)} > ${category.name}`;
}

// The fully-qualified path of a category's ANCESTORS (everything before the
// leaf), e.g. "House > Utilities > Madison" for the "Internet" leaf. Returns
// "" for a root-level category. Use alongside `category.name` to show the
// breadcrumb context without repeating the leaf.
export function categoryParentPath(category: MerchantCategory, merchantCategories: MerchantCategory[]): string {
  if (category.parentMerchantTagId === null || category.parentMerchantTagId === undefined) {
    return "";
  }

  const parentCategory = merchantCategories.find(t => t.id === category.parentMerchantTagId);
  if (!parentCategory) {
    return "";
  }

  return fullyQualifiedCategoryName(parentCategory, merchantCategories);
}
