// Inline in <head>: resolve a language before rendering the default-language page.
(() => {
  const { locales, defaultLocale, preferenceKey } = document.currentScript.dataset;
  const supported = JSON.parse(locales);
  const url = new URL(window.location.href);
  const firstSegment = url.pathname.split('/').filter(Boolean)[0];

  // A shared or bookmarked localized URL always opens in its own language.
  if (supported.includes(firstSegment)) return;

  // Used when a manual choice cannot be stored (for example, blocked storage).
  let preferred = url.searchParams.get('lang');
  if (!supported.includes(preferred)) {
    try {
      preferred = window.localStorage.getItem(preferenceKey);
    } catch {
      preferred = null;
    }
  }

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const detected = browserLanguages
    .map((language) => (language || '').toLowerCase().split(/[-_]/)[0])
    .find((language) => supported.includes(language));
  const target = supported.includes(preferred) ? preferred : detected || defaultLocale;
  if (target === defaultLocale) return;

  url.pathname = `/${target}${url.pathname}`;
  window.location.replace(url.href);
})();
