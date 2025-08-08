import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Ensure locale is valid
  const validLocale = ['en', 'pl'].includes(locale) ? locale : 'en';
  
  return {
    locale: validLocale,
    messages: {
      common: (await import(`./locales/${validLocale}/common.json`)).default,
      auth: (await import(`./locales/${validLocale}/auth.json`)).default
    }
  };
}); 