"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  CameraIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function HowItWorks() {
  const t = useTranslations('root.howItWorks');

  const brandSteps = [
    {
      icon: MagnifyingGlassIcon,
      titleKey: 'brand.step1.title',
      descriptionKey: 'brand.step1.description',
      color: 'bg-red-burgundy',
      number: '01'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      titleKey: 'brand.step2.title', 
      descriptionKey: 'brand.step2.description',
      color: 'bg-red-wine',
      number: '02'
    },
    {
      icon: CreditCardIcon,
      titleKey: 'brand.step3.title',
      descriptionKey: 'brand.step3.description', 
      color: 'bg-purple-600',
      number: '03'
    },
    {
      icon: CheckCircleIcon,
      titleKey: 'brand.step4.title',
      descriptionKey: 'brand.step4.description',
      color: 'bg-green-600', 
      number: '04'
    }
  ];

  const creatorSteps = [
    {
      icon: UserIcon,
      titleKey: 'creator.step1.title',
      descriptionKey: 'creator.step1.description',
      color: 'bg-red-burgundy',
      number: '01'
    },
    {
      icon: CalendarDaysIcon,
      titleKey: 'creator.step2.title',
      descriptionKey: 'creator.step2.description',
      color: 'bg-red-wine', 
      number: '02'
    },
    {
      icon: CameraIcon,
      titleKey: 'creator.step3.title',
      descriptionKey: 'creator.step3.description',
      color: 'bg-purple-600',
      number: '03'
    },
    {
      icon: GlobeAltIcon,
      titleKey: 'creator.step4.title', 
      descriptionKey: 'creator.step4.description',
      color: 'bg-green-600',
      number: '04'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-ivory to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-burgundy rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-wine rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-burgundy/10 backdrop-blur-sm border border-red-burgundy/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-red-burgundy rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-burgundy tracking-wide uppercase">
              {t('badge')}
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-serif font-bold text-red-burgundy mb-6 leading-tight">
            {t('title')}
          </h2>
          <p className="text-xl text-subtext max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Brand Process */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-red-burgundy/10 mb-4">
              <div className="w-8 h-8 bg-red-burgundy/10 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-red-burgundy">B</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-serif font-bold text-red-burgundy">
                {t('brand.title')}
              </h3>
            </div>
            <p className="text-lg text-subtext max-w-2xl mx-auto">
              {t('brand.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Connection line */}
                  {index < brandSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-red-burgundy/30 to-red-burgundy/10 z-0"></div>
                  )}
                  
                  <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-red-burgundy/5 h-full">
                    {/* Step number */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-red-burgundy to-red-wine rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-xl font-serif font-bold text-text mb-4 leading-tight">
                      {t(step.titleKey)}
                    </h4>
                    <p className="text-subtext leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-24">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-burgundy/20 to-transparent"></div>
          <div className="mx-8 w-3 h-3 bg-red-burgundy rounded-full"></div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-burgundy/20 to-transparent"></div>
        </div>

        {/* Creator Process */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-red-burgundy/10 mb-4">
              <div className="w-8 h-8 bg-purple-600/10 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">C</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-serif font-bold text-red-burgundy">
                {t('creator.title')}
              </h3>
            </div>
            <p className="text-lg text-subtext max-w-2xl mx-auto">
              {t('creator.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {creatorSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Connection line */}
                  {index < creatorSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-600/30 to-purple-600/10 z-0"></div>
                  )}
                  
                  <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-purple-600/5 h-full">
                    {/* Step number */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-xl font-serif font-bold text-text mb-4 leading-tight">
                      {t(step.titleKey)}
                    </h4>
                    <p className="text-subtext leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-red-burgundy to-red-wine rounded-3xl p-12 text-white shadow-2xl"
        >
          <h3 className="text-3xl lg:text-4xl font-serif font-bold mb-6">
            {t('cta.title')}
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/auth/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-red-burgundy px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-red-burgundy hover:text-white border-2 border-white hover:border-white transition-all duration-300 shadow-lg"
            >
              {t('cta.brandButton')}
            </motion.a>
            <motion.a
              href="/auth/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-transparent text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-red-burgundy border-2 border-white transition-all duration-300"
            >
              {t('cta.creatorButton')}
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 