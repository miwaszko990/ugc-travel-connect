'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from './button'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('en')}
        className="px-3 py-1 text-xs"
      >
        EN
      </Button>
      <Button
        variant={locale === 'pl' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('pl')}
        className="px-3 py-1 text-xs"
      >
        PL
      </Button>
    </div>
  )
} 