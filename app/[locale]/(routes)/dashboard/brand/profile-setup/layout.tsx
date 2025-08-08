import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

const locales = ['en', 'pl'];

// Edge Runtime compatibility for better performance
export const runtime = 'edge';
export const preferredRegion = 'auto';

export default async function ProfileSetupLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Load only the specific translations needed for this page
  // This reduces bundle size significantly compared to loading all translations
  const messages = {
    brand: {
      profileSetup: (await import(`../../../../../locales/${locale}/brand.json`)).default.profileSetup
    }
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
} 