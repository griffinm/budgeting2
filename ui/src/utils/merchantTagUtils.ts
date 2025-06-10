import { MerchantTag } from "./types";

export function formatMerchantTagsAsTree({ merchantTags }: { merchantTags: MerchantTag[] }): MerchantTag[] {
  if (!merchantTags || merchantTags.length === 0) {
    return [];
  }

  // Create a map to store all tags with their children initialized
  const tagMap = new Map<number, MerchantTag>();
  
  // First pass: Initialize all tags with empty children arrays
  merchantTags.forEach(tag => {
    tagMap.set(tag.id, { 
      ...tag, 
      children: [] 
    });
  });
  
  // Second pass: Build the tree structure by assigning children to parents
  // This supports arbitrary nesting levels because we process all relationships
  const rootTags: MerchantTag[] = [];
  
  merchantTags.forEach(tag => {
    const currentTag = tagMap.get(tag.id);
    if (!currentTag) return; // Safety check
    
    if (tag.parentMerchantTagId === null || tag.parentMerchantTagId === undefined) {
      // This is a root-level tag
      rootTags.push(currentTag);
    } else {
      // This is a child tag - find its parent and add it to parent's children
      const parentTag = tagMap.get(tag.parentMerchantTagId);
      if (parentTag) {
        parentTag.children.push(currentTag);
      } else {
        // Parent not found - treat as root (orphaned tag)
        console.warn(`Parent tag with ID ${tag.parentMerchantTagId} not found for tag "${tag.name}". Treating as root tag.`);
        rootTags.push(currentTag);
      }
    }
  });
  
  return rootTags;
}
