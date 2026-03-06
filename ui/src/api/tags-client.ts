import { baseClient } from "@/api/base-client";
import { Tag, TagSpendStats } from "@/utils/types";

export const fetchTags = async (): Promise<Tag[]> => {
  const response = await baseClient.get('/tags');
  return response.data;
};

export const fetchTagSpendStats = async ({ tagIds, monthsBack }: {
  tagIds: number[];
  monthsBack?: number;
}): Promise<TagSpendStats[]> => {
  const response = await baseClient.get('/tags/spend_stats', {
    params: { tag_ids: tagIds, months_back: monthsBack },
  });
  return response.data;
};

export const createTag = async ({ name }: { name: string }): Promise<Tag> => {
  const response = await baseClient.post('/tags', { tag: { name } });
  return response.data;
};
