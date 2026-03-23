import i18n from "i18next";

/**
 * Derives the Wikipedia language subdomain from the current i18next language.
 * Maps BCP 47 tags (e.g. "en-GB", "fr-FR") to Wikipedia subdomains ("en", "fr").
 */
export function getWikipediaLang(): string {
  const resolved = i18n.resolvedLanguage ?? i18n.language ?? "en-GB";
  // Wikipedia subdomains use the primary language subtag
  return resolved.split("-")[0].toLowerCase();
}

/**
 * Builds a Wikipedia article URL for the given slug, localised to the
 * current i18next language.
 */
export function getWikipediaUrl(slug: string): string {
  return `https://${getWikipediaLang()}.wikipedia.org/wiki/${slug}`;
}

/**
 * Returns the Wikipedia REST API base URL for the current language.
 */
export function getWikipediaApiBase(): string {
  return `https://${getWikipediaLang()}.wikipedia.org/api/rest_v1`;
}

/**
 * Returns the English Wikipedia REST API base URL.
 * Always returns the English endpoint regardless of the current i18n language.
 * Use this for image/thumbnail fetches to ensure maximum image availability,
 * since English Wikipedia has the most complete collection of composer images.
 */
export function getEnglishWikipediaApiBase(): string {
  return "https://en.wikipedia.org/api/rest_v1";
}
