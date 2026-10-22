export function normalizeMenuSearchText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function menuSearchMatches(query, searchableText) {
  const normalizedQuery = normalizeMenuSearchText(query.trim());
  return !normalizedQuery || normalizeMenuSearchText(searchableText).includes(normalizedQuery);
}
