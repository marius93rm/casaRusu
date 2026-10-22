import type { ro } from './locales/ro';

type Translate<T> = T extends string ? string
  : T extends readonly (infer Item)[] ? readonly Translate<Item>[]
  : { readonly [Key in keyof T]: Translate<T[Key]> };

/** Every locale must supply all copy, labels and metadata from the base language. */
export type Translation = Translate<typeof ro>;
