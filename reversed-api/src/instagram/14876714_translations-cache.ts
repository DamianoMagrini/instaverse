/**
 * @module translations-cache
 *
 * Add and retrieve translations to and from cache.
 *
 * Dependencies:
 *  - sw-constants (14876672)
 */

import * as SW_CONSTANTS from './14876672_sw-constants';

const enum ERRORS {
  CANNOT_STORE_CACHE_UNSUPPORTED = 'Unable to store translations, cache storage unsupported',
  CANNOT_LOAD_CACHE_UNSUPPORTED = 'Unable to load translations, cache storage unsupported',
  CANNOT_LOAD_ERROR_PARSING = 'Unable to load translations, error parsing response'
}

interface TranslationsDictionary {
  [key: string]: string | (string | object)[];
}

let translations: TranslationsDictionary = null;

const { swConfig } = SW_CONSTANTS.SW_CACHE_NAMES;

export const storeTranslations = async (
  translations: TranslationsDictionary
) => {
  let cache: Cache;
  if (caches) cache = await caches.open(swConfig);
  else throw new Error(ERRORS.CANNOT_STORE_CACHE_UNSUPPORTED);

  if (cache)
    cache.put(
      SW_CONSTANTS.TRANSLATIONS,
      new Response(JSON.stringify(translations))
    );
  else throw new Error(ERRORS.CANNOT_STORE_CACHE_UNSUPPORTED);
};

export const loadTranslations = async () => {
  const cache = await caches.open(swConfig);

  let raw_translations: Response;
  if (cache) raw_translations = await cache.match(SW_CONSTANTS.TRANSLATIONS);
  else throw new Error(ERRORS.CANNOT_LOAD_CACHE_UNSUPPORTED);

  let cached_translations: TranslationsDictionary;
  if (raw_translations)
    cached_translations = (await raw_translations.json()) as TranslationsDictionary;
  else throw new Error(ERRORS.CANNOT_LOAD_CACHE_UNSUPPORTED);

  if (cached_translations) return (translations = cached_translations);
  else throw new Error(ERRORS.CANNOT_LOAD_ERROR_PARSING);
};

export const getFbt = (translation_key: string) =>
  (translations && translations[translation_key]) || '';
