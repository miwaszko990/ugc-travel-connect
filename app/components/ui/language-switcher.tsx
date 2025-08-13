'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  // Derive locale from the path so this works even without NextIntlClientProvider
  const currentSegment = pathname.split('/')[1]
  const locale = (currentSegment === 'en' || currentSegment === 'pl') ? currentSegment : 'en'

  const switchLanguage = (newLocale: string) => {
    // Remove leading locale segment if present
    const pathWithoutLocale = pathname.replace(/^\/(en|pl)(?=\/|$)/, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    pl: { name: 'Polski', flag: '🇵🇱' }
  }

  const currentLanguage = languages[locale as keyof typeof languages]

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-lg transition-all duration-300 group border border-transparent hover:border-red-burgundy/20">
        <GlobeAltIcon className="h-4 w-4 group-hover:text-red-burgundy transition-colors duration-300" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="font-semibold">{locale.toUpperCase()}</span>
        <ChevronDownIcon className="h-3 w-3 group-hover:text-red-burgundy transition-colors duration-300" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 top-12 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50 border border-red-burgundy/10 overflow-hidden">
          {Object.entries(languages).map(([code, lang]) => (
            <Menu.Item key={code}>
              {({ active }) => (
                <button
                  onClick={() => switchLanguage(code)}
                  className={`${active ? 'bg-red-burgundy/10 text-red-burgundy' : 'text-gray-700'} ${locale === code ? 'bg-red-burgundy/5 font-semibold' : ''} flex items-center gap-3 px-4 py-3 text-sm w-full text-left transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs opacity-60">{code.toUpperCase()}</span>
                  </div>
                  {locale === code && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-red-burgundy rounded-full"></div>
                    </div>
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 