import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Ensure locale is valid
  const validLocale = ['en', 'pl'].includes(locale) ? locale : 'en';
  
  return {
    locale: validLocale,
    messages: {
      common: (await import(`./locales/${validLocale}/common.json`)).default,
      auth: (await import(`./locales/${validLocale}/auth.json`)).default,
      'auth-register': (await import(`./locales/${validLocale}/auth-register.json`)).default,
      'auth-login': (await import(`./locales/${validLocale}/auth-login.json`)).default,
      'auth-modal': (await import(`./locales/${validLocale}/auth-modal.json`)).default,
      brand: (await import(`./locales/${validLocale}/brand.json`)).default
    }
  };
}); 