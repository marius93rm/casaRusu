export const menuSearchQueryParam = 'q';
export const menuPriceLimitQueryParam = 'max';
export const menuCategoryQueryParam = 'category';
export const menuSortQueryParam = 'sort';

const menuSortModes = new Set(['price-asc', 'price-desc']);

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

export function parseMenuCategory(value, validCategories) {
  if (value === null) return '';
  const category = value.trim();
  return validCategories.has(category) ? category : '';
}

export function parseMenuSort(value) {
  const sortMode = value?.trim() ?? '';
  return menuSortModes.has(sortMode) ? sortMode : 'menu';
}

export function sortMenuItems(items, sortMode) {
  if (!menuSortModes.has(sortMode)) return [...items];

  const direction = sortMode === 'price-asc' ? 1 : -1;
  return [...items]
    .map((item, index) => ({ item, index, price: Number(item.dataset.menuPrice) }))
    .sort((left, right) => direction * (left.price - right.price) || left.index - right.index)
    .map(({ item }) => item);
}

export function updateMenuSearchUrl(currentUrl, query, priceLimit, defaultPriceLimit, category = '', sortMode = 'menu') {
  const url = new URL(currentUrl);
  const value = query.trim();
  const limit = Number(priceLimit);
  const selectedCategory = category.trim();

  if (value) url.searchParams.set(menuSearchQueryParam, value);
  else url.searchParams.delete(menuSearchQueryParam);

  if (Number.isFinite(limit) && limit >= 0 && limit < defaultPriceLimit) {
    url.searchParams.set(menuPriceLimitQueryParam, String(Math.round(limit)));
  } else {
    url.searchParams.delete(menuPriceLimitQueryParam);
  }

  if (selectedCategory) url.searchParams.set(menuCategoryQueryParam, selectedCategory);
  else url.searchParams.delete(menuCategoryQueryParam);

  if (menuSortModes.has(sortMode)) url.searchParams.set(menuSortQueryParam, sortMode);
  else url.searchParams.delete(menuSortQueryParam);

  return url;
}

export function menuSearchMatches(query, searchableText) {
  const queryTerms = normalizeMenuSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return true;

  const normalizedText = normalizeMenuSearchText(searchableText);
  return queryTerms.every((term) => normalizedText.includes(term));
}
