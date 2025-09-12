import React from 'react';

interface IndustrySelectProps {
  register: any;
  error: any;
  t: (key: string) => string;
}

export default function IndustrySelect({ register, error, t }: IndustrySelectProps) {
  return (
    <>
      <select
        className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
        }`}
        {...register('industry')}
      >
        <option value="">{t('form.industry.placeholder')}</option>
        <option value="travel">{t('form.industry.options.travel')}</option>
        <option value="hospitality">{t('form.industry.options.hospitality')}</option>
        <option value="fashion">{t('form.industry.options.fashion')}</option>
        <option value="beauty">{t('form.industry.options.beauty')}</option>
        <option value="foodBeverage">{t('form.industry.options.foodBeverage')}</option>
        <option value="technology">{t('form.industry.options.technology')}</option>
        <option value="lifestyle">{t('form.industry.options.lifestyle')}</option>
        <option value="fitnessWellness">{t('form.industry.options.fitnessWellness')}</option>
        <option value="entertainment">{t('form.industry.options.entertainment')}</option>
        <option value="other">{t('form.industry.options.other')}</option>
      </select>
      {error && (
        <p className="mt-1 text-red-500 text-xs">{error.message}</p>
      )}
    </>
  );
}

