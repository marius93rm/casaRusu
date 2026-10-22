import translations from './menu-translations.json';
import { locales } from './config';
import type { SiteLocale } from '../data/site';
import type { MenuItem } from '../data/menu';

type TranslatedLocale = Exclude<SiteLocale, 'ro'>;
type TranslationTable = Record<string, Record<TranslatedLocale, string>>;
const names: TranslationTable = translations.names;
const ingredients: TranslationTable = translations.ingredients;
const headings: TranslationTable = translations.headings;
const unchangedNames = new Set(translations.unchangedNames);
const unchangedIngredients = new Set(translations.unchangedIngredients);

function translate(value: string, locale: TranslatedLocale, table: TranslationTable, unchanged?: Set<string>): string {
  if (unchanged?.has(value)) return value;
  const translated = table[value]?.[locale];
  if (!translated) throw new Error(`Missing ${locale} menu translation: ${value}`);
  return translated;
}

export function menuTitles(ro: string, en: string): Record<SiteLocale, string> {
  return { ro, en, ...Object.fromEntries(
    locales.filter((locale) => locale !== 'ro' && locale !== 'en').map((locale) => [locale, translate(en, locale, headings)]),
  ) } as Record<SiteLocale, string>;
}

/** Translate exact printed terms, preserving quantities, prices and separators. */
export function localizedMenuItem(item: MenuItem, locale: SiteLocale): MenuItem {
  if (locale === 'ro') return item;
  return {
    ...item,
    name: translate(item.name, locale, names, unchangedNames),
    ingredients: item.ingredients.replace(/[^,;/]+/g, (part) => {
      const term = part.trim();
      return term ? part.replace(term, () => translate(term, locale, ingredients, unchangedIngredients)) : part;
    }),
  };
}
