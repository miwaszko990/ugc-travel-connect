'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';

// Preload critical resources for better performance
import { getStorage } from 'firebase/storage';
import { doc } from 'firebase/firestore';

// Lazy load non-critical components for better performance
const LazyImageUploader = dynamic(() => import('./components/ImageUploader'), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-red-burgundy/30 bg-red-burgundy/5 animate-pulse" />
  )
});

const LazyIndustrySelect = dynamic(() => import('./components/IndustrySelect'), {
  ssr: false,
  loading: () => (
    <select className="w-full p-3 border border-gray-300 rounded-xl animate-pulse" disabled>
      <option>Loading...</option>
    </select>
  )
});

// Form validation schema for brand - memoized for performance
const createBrandProfileSchema = (t: (key: string) => string) => z.object({
  brandName: z.string().min(1, { message: t('validation.brandNameRequired') }),
  instagramHandle: z.string().min(1, { message: t('validation.instagramRequired') }),
  website: z.string()
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (!val || val === '') return '';
      // If URL doesn't start with http:// or https://, add https://
      if (!val.match(/^https?:\/\//)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: t('validation.websiteInvalid') }),
  description: z.string().min(10, { message: t('validation.descriptionTooShort') }),
  industry: z.string().min(1, { message: t('validation.industryRequired') }),
  location: z.string().min(1, { message: t('validation.locationRequired') }),
});

type BrandProfileFormValues = z.infer<ReturnType<typeof createBrandProfileSchema>>;

export default function BrandProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('brand.profileSetup');
  const locale = useLocale();
  
  // State management
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Memoized schema creation to prevent recreation on every render
  const brandProfileSchema = useMemo(() => createBrandProfileSchema(t), [t]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setFocus,
    setValue
  } = useForm<BrandProfileFormValues>({
    resolver: zodResolver(brandProfileSchema),
    mode: 'onChange',
  });

  // Memoized form field styles to prevent recalculation
  const getFieldClassName = useCallback((hasError: boolean) => 
    `w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
    }`, []
  );

  // Performance monitoring for data loading
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Mark the start of profile loading for performance tracking
      performance.mark('profile-load-start');
    }
  }, []);

  // Load existing profile data if in edit mode
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if brand profile has been set up before
          if (userData.brandName) {
            console.log('Loading existing brand profile data for editing');
            setIsEditMode(true);
            
            // Populate form fields with existing data
            setValue('brandName', userData.brandName || '');
            setValue('instagramHandle', userData.instagramHandle || '');
            setValue('website', userData.website || '');
            setValue('description', userData.description || '');
            setValue('industry', userData.industry || '');
            setValue('location', userData.location || '');
            
            // Set profile image preview if it exists
            if (userData.profileImageUrl) {
              setImagePreview(userData.profileImageUrl);
            }
          }
        }
        
        setLoading(false);
        
        // Performance monitoring
        if (typeof window !== 'undefined' && 'performance' in window) {
          performance.mark('profile-load-end');
          performance.measure('profile-load-duration', 'profile-load-start', 'profile-load-end');
        }
      } catch (error) {
        console.error('Error loading brand profile data:', error);
        setLoading(false);
        
        // Performance monitoring for errors
        if (typeof window !== 'undefined' && 'performance' in window) {
          performance.mark('profile-load-error');
        }
      }
    };
    
    loadExistingProfile();
  }, [user, setValue]);

  // Set focus on the first error field
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof BrandProfileFormValues;
    if (firstError) {
      setFocus(firstError);
    }
  }, [errors, setFocus]);

  // Memoized handlers for better performance
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
      
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.invalidImageType'));
      return;
    }
      
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('messages.imageTooLarge'));
      return;
    }
      
    console.log('Valid brand logo selected:', file.name, file.size, file.type);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, [t]);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Upload image to Firebase Storage
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    if (!file || !user) throw new Error("Missing file or user");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const storage = getStorage();
    const fileRef = storageRef(storage, `brandLogos/${user.uid}/${Date.now()}_${file.name}`);
    
    return new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          console.error('Upload error:', error);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            setIsUploading(false);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setIsUploading(false);
            reject(error);
          }
        }
      );
    });
  }, [user]);

  // Handle form submission
  const onSubmit = useCallback(async (data: BrandProfileFormValues) => {
    if (!user) {
      toast.error(t('messages.loginRequired'));
      return;
    }
    
    // setIsSubmitting(true); // This is handled by react-hook-form
    
    try {
      console.log('Starting brand profile submission with data:', data);
      
      // Upload image if one was selected
      let imageUrl = null;
      if (imageFile) {
        console.log('Brand logo selected, starting upload...');
        try {
          imageUrl = await handleImageUpload(imageFile);
          console.log('Brand logo upload successful, URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading brand logo:', error);
          toast.error(t('messages.imageUploadFailed'));
        }
      } else if (imagePreview && !imageFile) {
        // User didn't upload a new image, but had an existing one
        imageUrl = imagePreview;
      }
      
      // Create brand profile data
      const brandProfileData = {
        brandName: data.brandName,
        instagramHandle: data.instagramHandle,
        website: data.website || '',
        description: data.description,
        industry: data.industry,
        location: data.location,
        profileComplete: true,
        updatedAt: new Date(),
        profileImageUrl: imageUrl,
        role: 'brand' // Ensure role is set correctly
      };
      
      console.log('Final brand profile data being saved:', brandProfileData);
      
      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), brandProfileData, { merge: true });
      console.log('Brand profile updated successfully!');
      
      // Show success message but keep loading state for smooth transition
      toast.success(isEditMode ? t('messages.profileUpdated') : t('messages.profileCreated'));
      
      // Store profile data in sessionStorage for instant dashboard loading
      sessionStorage.setItem('profileComplete', 'true');
      sessionStorage.setItem('brandProfile', JSON.stringify(brandProfileData));
      
      // Small delay to let user see success message, then redirect
      setTimeout(() => {
        router.push(`/${locale}/dashboard/brand`);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating brand profile:', error);
      toast.error(t('messages.updateFailed'));
      // setIsSubmitting(false); // This is handled by react-hook-form
    }
  }, [user, t, imageFile, imagePreview, handleImageUpload, isEditMode, router, locale]);

  // Memoized titles to prevent unnecessary re-renders
  const pageTitle = useMemo(() => 
    isEditMode ? t('editTitle') : t('title'), [isEditMode, t]
  );
  
  const pageSubtitle = useMemo(() => 
    isEditMode ? t('editSubtitle') : t('subtitle'), [isEditMode, t]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{backgroundColor: '#FDFCF9'}}>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{backgroundColor: '#FDFCF9'}}>
      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {isEditMode ? t('form.submit.updating') : t('form.submit.creating')}
            </h3>
            <p className="text-gray-600">
              {t('messages.redirecting')}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[600px] mx-auto bg-white rounded-[24px] shadow-lg p-8 relative">
        {/* Close button */}
        <button
          onClick={() => router.push(`/${locale}/dashboard/brand`)}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors group"
          type="button"
          aria-label={t('form.close') || 'Close'}
        >
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-3xl font-serif font-bold text-center mb-2 text-red-burgundy">
          {pageTitle}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {pageSubtitle}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand Logo Upload - Lazy loaded component */}
          <LazyImageUploader
            imagePreview={imagePreview}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onImageClick={handleImageClick}
            onImageChange={handleImageChange}
            fileInputRef={fileInputRef}
            t={t}
          />
          
          {/* Brand Name */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.brandName.label')} *</label>
            <input
              type="text"
              className={getFieldClassName(!!errors.brandName)}
              placeholder={t('form.brandName.placeholder')}
              {...register('brandName')}
            />
            {errors.brandName && (
              <p className="mt-1 text-red-500 text-xs">{errors.brandName.message}</p>
            )}
          </div>
          
          {/* Instagram Handle */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.instagramHandle.label')} *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                className={`w-full p-3 pl-8 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.instagramHandle ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
                }`}
                placeholder={t('form.instagramHandle.placeholder')}
                {...register('instagramHandle')}
              />
            </div>
            {errors.instagramHandle && (
              <p className="mt-1 text-red-500 text-xs">{errors.instagramHandle.message}</p>
            )}
          </div>
          
          {/* Website */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.website.label')}</label>
            <input
              type="url"
              className={getFieldClassName(!!errors.website)}
              placeholder={t('form.website.placeholder')}
              {...register('website')}
            />
            {errors.website && (
              <p className="mt-1 text-red-500 text-xs">{errors.website.message}</p>
            )}
          </div>
          
          {/* Industry - Lazy loaded component */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.industry.label')} *</label>
            <LazyIndustrySelect
              register={register}
              error={errors.industry}
              t={t}
            />
          </div>
          
          {/* Location */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.location.label')} *</label>
            <input
              type="text"
              className={getFieldClassName(!!errors.location)}
              placeholder={t('form.location.placeholder')}
              {...register('location')}
            />
            {errors.location && (
              <p className="mt-1 text-red-500 text-xs">{errors.location.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.description.label')} *</label>
            <textarea
              rows={4}
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              placeholder={t('form.description.placeholder')}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-red-burgundy hover:bg-red-burgundy/90 text-white py-3 px-4 rounded-xl mt-6 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" color="secondary" className="mr-2" />
                <span>{isEditMode ? t('form.submit.updating') : t('form.submit.creating')}</span>
              </>
            ) : (
              isEditMode ? t('form.submit.update') : t('form.submit.create')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
