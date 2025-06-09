const PARAMS_TO_FILTER = ['totalPages', 'totalCount', 'currentPage'];

export const queryStringFromObject = (obj: Record<string, string | number | boolean | undefined>) => {
  const filteredObj = Object.entries(obj)
    .filter(([key]) => !PARAMS_TO_FILTER.includes(key));

  return filteredObj
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};