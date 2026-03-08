import { baseClient } from "@/api/base-client";
import { Tag, TagSpendStats } from "@/utils/types";

export const fetchTags = async (): Promise<Tag[]> => {
  const response = await baseClient.get('/tags');
  return response.data;
};

export const fetchTagSpendStats = async ({ tagIds, monthsBack, omitTagIds }: {
  tagIds: number[];
  monthsBack?: number;
  omitTagIds?: number[];
}): Promise<TagSpendStats[]> => {
  const params = new URLSearchParams();
  tagIds.forEach(id => params.append('tag_ids[]', id.toString()));
  if (omitTagIds) omitTagIds.forEach(id => params.append('omit_tag_ids[]', id.toString()));
  if (monthsBack) params.append('months_back', monthsBack.toString());
  const response = await baseClient.get('/tags/spend_stats', {
    params,
  });
  return response.data;
};

export const createTag = async ({ name }: { name: string }): Promise<Tag> => {
  const response = await baseClient.post('/tags', { tag: { name } });
  return response.data;
};
