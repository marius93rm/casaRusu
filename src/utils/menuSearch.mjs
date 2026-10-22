export function normalizeMenuSearchText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function menuSearchMatches(query, searchableText) {
  const queryTerms = normalizeMenuSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return true;

  const normalizedText = normalizeMenuSearchText(searchableText);
  return queryTerms.every((term) => normalizedText.includes(term));
}
