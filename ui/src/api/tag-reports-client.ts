import { baseClient } from "@/api/base-client";
import { TagReport } from "@/utils/types";

export const fetchTagReports = async (): Promise<TagReport[]> => {
  const response = await baseClient.get('/tag_reports');
  return response.data;
};

export const createTagReport = async ({ name, description, includedTagIds, omittedTagIds }: {
  name: string;
  description?: string;
  includedTagIds: number[];
  omittedTagIds: number[];
}): Promise<TagReport> => {
  const tagReportTagsAttributes = [
    ...includedTagIds.map(tagId => ({ tag_id: tagId, role: 'include' })),
    ...omittedTagIds.map(tagId => ({ tag_id: tagId, role: 'omit' })),
  ];
  const response = await baseClient.post('/tag_reports', {
    tag_report: { name, description, tag_report_tags_attributes: tagReportTagsAttributes },
  });
  return response.data;
};

export const deleteTagReport = async (id: number): Promise<void> => {
  await baseClient.delete(`/tag_reports/${id}`);
};
