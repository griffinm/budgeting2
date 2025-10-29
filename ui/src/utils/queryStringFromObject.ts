const PARAMS_TO_FILTER = ['totalPages', 'totalCount', 'currentPage', 'page', 'perPage'];

export const queryStringFromObject = (obj: Record<string, string | number | boolean | undefined | object>) => {
  const filteredObj = Object.entries(obj)
    .filter(([key]) => !PARAMS_TO_FILTER.includes(key));

  return filteredObj
    .flatMap(([key, value]) => {
      // Handle arrays by creating multiple query params with the same key
      if (Array.isArray(value)) {
        return value.map(item => `${key}[]=${encodeURIComponent(item)}`);
      }
      // Handle undefined/null values
      if (value === undefined || value === null) {
        return [];
      }
      // Handle regular values
      return [`${key}=${encodeURIComponent(String(value))}`];
    })
    .join('&');
};
