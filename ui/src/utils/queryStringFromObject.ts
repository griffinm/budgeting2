const PARAMS_TO_FILTER = ['totalPages', 'totalCount', 'currentPage'];

export const queryStringFromObject = (obj: Record<string, string | number | boolean | undefined>) => {
  console.log(obj);
  const filteredObj = Object.entries(obj)
    .filter(([key]) => !PARAMS_TO_FILTER.includes(key));
  console.log(filteredObj);
  return filteredObj
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};