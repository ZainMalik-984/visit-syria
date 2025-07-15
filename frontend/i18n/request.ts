// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    console.log('Request locale:',await requestLocale);
  // Await the requestLocale promise to get the locale (or undefined)
  let locale = await requestLocale;

  // Fallback to 'en' if locale is undefined (e.g., no prefix in URL)
  if (!locale) {
    locale = 'en'; // Or your defaultLocale
  }

  // Validate against supported locales (optional, but recommended)
  const supportedLocales = ['en', 'fr']; // Add your locales here
  if (!supportedLocales.includes(locale)) {
    locale = 'en'; // Fallback to default
  }

  return {
    locale, // Required: Return the resolved locale
    messages: (await import(`../messages/${locale}.json`)).default, // Adjust path as before
  };
});
