export const menuSearchQueryParam = 'q';
export const menuPriceLimitQueryParam = 'max';

export function normalizeMenuSearchText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function parseMenuPriceLimit(value, defaultPriceLimit) {
  if (value === null || !value.trim()) return defaultPriceLimit;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultPriceLimit;
  return Math.min(defaultPriceLimit, Math.max(0, Math.round(parsed)));
}

export function updateMenuSearchUrl(currentUrl, query, priceLimit, defaultPriceLimit) {
  const url = new URL(currentUrl);
  const value = query.trim();
  const limit = Number(priceLimit);

  if (value) url.searchParams.set(menuSearchQueryParam, value);
  else url.searchParams.delete(menuSearchQueryParam);

  if (Number.isFinite(limit) && limit >= 0 && limit < defaultPriceLimit) {
    url.searchParams.set(menuPriceLimitQueryParam, String(Math.round(limit)));
  } else {
    url.searchParams.delete(menuPriceLimitQueryParam);
  }

  return url;
}

export function menuSearchMatches(query, searchableText) {
  const queryTerms = normalizeMenuSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return true;

  const normalizedText = normalizeMenuSearchText(searchableText);
  return queryTerms.every((term) => normalizedText.includes(term));
}
