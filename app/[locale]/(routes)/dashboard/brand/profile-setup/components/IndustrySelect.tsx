import { memo } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface BrandProfileFormValues {
  brandName: string;
  instagramHandle: string;
  website?: string;
  description: string;
  industry: string;
  location: string;
}

interface IndustrySelectProps {
  register: UseFormRegister<BrandProfileFormValues>;
  error?: FieldError;
  t: (key: string) => string;
}

const IndustrySelect = memo(function IndustrySelect({
  register,
  error,
  t
}: IndustrySelectProps) {
  return (
    <>
      <select
        className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
        }`}
        {...register('industry')}
      >
        <option value="">{t('form.industry.placeholder')}</option>
        <option value="Travel & Tourism">{t('form.industry.options.travel')}</option>
        <option value="Hospitality">{t('form.industry.options.hospitality')}</option>
        <option value="Fashion">{t('form.industry.options.fashion')}</option>
        <option value="Beauty">{t('form.industry.options.beauty')}</option>
        <option value="Food & Beverage">{t('form.industry.options.foodBeverage')}</option>
        <option value="Technology">{t('form.industry.options.technology')}</option>
        <option value="Lifestyle">{t('form.industry.options.lifestyle')}</option>
        <option value="Fitness & Wellness">{t('form.industry.options.fitnessWellness')}</option>
        <option value="Entertainment">{t('form.industry.options.entertainment')}</option>
        <option value="Other">{t('form.industry.options.other')}</option>
      </select>
      {error && (
        <p className="mt-1 text-red-500 text-xs">{error.message}</p>
      )}
    </>
  );
});

export default IndustrySelect; 