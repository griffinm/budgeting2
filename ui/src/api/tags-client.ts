import { baseClient } from "@/api/base-client";
import { Tag } from "@/utils/types";

export const fetchTags = async (): Promise<Tag[]> => {
  const response = await baseClient.get('/tags');
  return response.data;
};

export const createTag = async ({ name }: { name: string }): Promise<Tag> => {
  const response = await baseClient.post('/tags', { tag: { name } });
  return response.data;
};
