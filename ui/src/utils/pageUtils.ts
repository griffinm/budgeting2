import { PageRequestParams } from "./types";

const DEFAULT_PAGE_SIZE = 25;

export function getUrlPagePageParams({
  pageRequestParams,
}: {
  pageRequestParams?: PageRequestParams;
}): string {
  if (!pageRequestParams) {
    return '';
  }

  return `page=${pageRequestParams.page.currentPage || 1}&per_page=${pageRequestParams.perPage || DEFAULT_PAGE_SIZE}`;
}
