import { MantineTreeNode, MerchantTag } from "./types";

export function formatMerchantTagsAsTree({ merchantTags }: { merchantTags: MerchantTag[] }): MantineTreeNode[] {
  if (!merchantTags || merchantTags.length === 0) {
    return [];
  }

  // Create a clone to avoid modifying the original array, and an easy lookup map.
  const tagMap: Record<number, MerchantTag & { children: MerchantTag[] }> = {};
  for (const tag of merchantTags) {
    tagMap[tag.id] = { ...tag, children: [] };
  }

  const roots: (MerchantTag & { children: MerchantTag[] })[] = [];

  for (const tag of Object.values(tagMap)) {
    if (tag.parentMerchantTagId) {
      const parent = tagMap[tag.parentMerchantTagId];
      if (parent) {
        parent.children.push(tag);
      } else {
        // Orphan tag, treat as a root.
        roots.push(tag);
      }
    } else {
      // Root tag.
      roots.push(tag);
    }
  }

  function convertToMantineTree(tags: (MerchantTag & { children: MerchantTag[] })[]): MantineTreeNode[] {
    return tags.map(tag => ({
      value: String(tag.id),
      label: tag.name,
      children: tag.children.length > 0 ? convertToMantineTree(tag.children) : undefined,
    }));
  }

  return convertToMantineTree(roots);
}