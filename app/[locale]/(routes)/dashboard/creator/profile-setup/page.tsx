'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { AUTH_CONSTANTS } from '@/app/lib/constants/auth';
import { useLocale } from 'next-intl';

type ServicePackage = {
  name: string;
  price: string;
  description: string;
};

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  instagramHandle: string;
  followerCount: number;
  homeCity: string;
  height: string;
  clothingSize: string;
  shoeSize: string;
};

export default function CreatorProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('creator.profileSetup');
  const locale = useLocale();
  
  const profileSchema = z.object({
    firstName: z.string().min(1, { message: t('fields.firstName.required') }),
    lastName: z.string().min(1, { message: t('fields.lastName.required') }),
    instagramHandle: z.string().min(1, { message: t('fields.instagramHandle.required') }),
    followerCount: z.coerce.number().min(0, { message: t('fields.followerCount.required') }),
    homeCity: z.string().min(1, { message: t('fields.homeCity.required') }),
    height: z.string().optional(),
    clothingSize: z.string().optional(),
    shoeSize: z.string().optional(),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioTitles, setPortfolioTitles] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setFocus,
    setValue
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.firstName) {
            setIsEditMode(true);
            setValue('firstName', userData.firstName || '');
            setValue('lastName', userData.lastName || '');
            setValue('instagramHandle', userData.instagramHandle || '');
            setValue('followerCount', userData.followerCount || 0);
            setValue('homeCity', userData.homeCity || '');
            setValue('height', userData.height || '');
            setValue('clothingSize', userData.clothingSize || '');
            setValue('shoeSize', userData.shoeSize || '');
            
            if (userData.profileImageUrl) {
              setImagePreview(userData.profileImageUrl);
            }
            
            // Portfolio items are loaded from Firebase in dashboard portfolio tab
            
            if (userData.servicePackages && userData.servicePackages.length > 0) {
              setServicePackages(userData.servicePackages);
            }
            

          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile data:', error);
        setLoading(false);
      }
    };
    
    loadExistingProfile();
  }, [user, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
      
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
      
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)');
      return;
    }
      
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPortfolioFiles([...portfolioFiles, ...files]);
    setPortfolioTitles([...portfolioTitles, ...files.map(() => '')]);
  };

  const updatePortfolioTitle = (index: number, value: string) => {
    const updated = [...portfolioTitles];
    updated[index] = value;
    setPortfolioTitles(updated);
  };

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index));
    setPortfolioTitles(portfolioTitles.filter((_, i) => i !== index));
  };

  const addServicePackage = () => {
    setServicePackages([...servicePackages, { name: '', price: '', description: '' }]);
  };

  const updateServicePackage = (index: number, field: keyof ServicePackage, value: string) => {
    const updated = [...servicePackages];
    updated[index][field] = value;
    setServicePackages(updated);
  };

  const removeServicePackage = (index: number) => {
    setServicePackages(servicePackages.filter((_, i) => i !== index));
  };



  const handleImageUpload = async (file: File): Promise<string> => {
    if (!file || !user) throw new Error("Missing file or user");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const storage = getStorage();
    const fileRef = storageRef(storage, `profileImages/${user.uid}/${Date.now()}_${file.name}`);
    
    return new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            resolve(downloadURL);
          } catch (error) {
            setIsUploading(false);
            reject(error);
          }
        }
      );
    });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error(t('messages.loginRequired'));
      return;
    }
    
    try {
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await handleImageUpload(imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(t('messages.imageUploadFailed'));
          // Continue with profile save even if image upload fails
          imageUrl = null;
        }
      } else if (imagePreview && !imageFile) {
        imageUrl = imagePreview;
      }
      
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        instagramHandle: data.instagramHandle,
        followerCount: data.followerCount,
        homeCity: data.homeCity,
        height: data.height || '',
        clothingSize: data.clothingSize || '',
        shoeSize: data.shoeSize || '',
        servicePackages: servicePackages.filter(pkg => pkg.name && pkg.price && pkg.description),
        profileComplete: true,
        updatedAt: new Date(),
        profileImageUrl: imageUrl
      };
      
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      
      // Upload portfolio items if any
      if (portfolioFiles.length > 0) {
        setUploadingPortfolio(true);
        const { addPortfolioItem, uploadPortfolioFile } = await import('@/app/lib/firebase/portfolio');
        
        for (let i = 0; i < portfolioFiles.length; i++) {
          const file = portfolioFiles[i];
          const title = portfolioTitles[i];
          
          try {
            // Upload file to storage
            const fileUrl = await uploadPortfolioFile(file, user.uid);
            
            // Add to portfolio
            await addPortfolioItem(user.uid, {
              type: file.type.startsWith('video') ? 'video' : 'image',
              url: fileUrl,
              title: title || undefined,
              uploadedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error uploading portfolio item:', error);
          }
        }
        setUploadingPortfolio(false);
      }
      
      toast.success(isEditMode ? t('messages.profileUpdateSuccess') : t('messages.profileCreateSuccess'));
      
      router.push(`/${locale}/dashboard/creator`);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(t('messages.profileSaveFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <Spinner size="lg" />
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-neutral mb-2 font-playfair">Loading...</h3>
            <p className="text-gray-500 font-inter">Setting up your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className={`bg-white ${AUTH_CONSTANTS.FORM.CARD_RADIUS} shadow-lg p-8 max-w-[600px] w-full relative`}>
        {/* Close button */}
        <button
          onClick={() => router.push(`/${locale}/dashboard/creator`)}
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
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral mb-2 font-playfair">
              {isEditMode ? t('title.edit') : t('title.create')}
            </h1>
            <p className="text-gray-500 text-sm font-inter">
              {isEditMode ? t('subtitle.edit') : t('subtitle.create')}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={handleImageClick}
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center bg-[#F4F4F5] hover:bg-gray-100 transition-colors"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs text-gray-500 text-center">Add Photo</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {isUploading && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-red-burgundy h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.firstName.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.firstName ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.firstName.placeholder')}
                {...register('firstName')}
              />
              {errors.firstName && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-error text-xs">{errors.firstName.message}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.lastName.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.lastName ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.lastName.placeholder')}
                {...register('lastName')}
              />
              {errors.lastName && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-error text-xs">{errors.lastName.message}</span>
                </label>
              )}
            </div>
          </div>
          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">{t('fields.instagramHandle.label')}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">@</span>
              </div>
              <input
                type="text"
                className={`input h-12 pl-8 pr-4 w-full rounded-xl font-medium ${
                  errors.instagramHandle ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.instagramHandle.placeholder')}
                {...register('instagramHandle')}
              />
            </div>
            {errors.instagramHandle && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.instagramHandle.message}</span>
              </label>
            )}
          </div>
          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">{t('fields.followerCount.label')}</span>
            </label>
            <input
              type="number"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.followerCount ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
              placeholder={t('fields.followerCount.placeholder')}
              {...register('followerCount')}
            />
            {errors.followerCount && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.followerCount.message}</span>
              </label>
            )}
          </div>
          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">{t('fields.homeCity.label')}</span>
            </label>
            <input
              type="text"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.homeCity ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
              placeholder={t('fields.homeCity.placeholder')}
              {...register('homeCity')}
            />
            {errors.homeCity && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.homeCity.message}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.height.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.height ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.height.placeholder')}
                {...register('height')}
              />
              {errors.height && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-error text-xs">{errors.height.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.clothingSize.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.clothingSize ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.clothingSize.placeholder')}
                {...register('clothingSize')}
              />
              {errors.clothingSize && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-error text-xs">{errors.clothingSize.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.shoeSize.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.shoeSize ? 'bg-white border-2 border-red-500' : 'bg-[#F4F4F5] border-0'
                } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
                placeholder={t('fields.shoeSize.placeholder')}
                {...register('shoeSize')}
              />
              {errors.shoeSize && (
                <label className="label py-0.5">
                  <span className="label-text-alt text-error text-xs">{errors.shoeSize.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* Portfolio Upload Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-playfair">
                  Portfolio
                </h3>
                <p className="text-gray-500 text-sm">
                  Dodaj zdjęcia i wideo do swojego portfolio
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-purple-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">
                      Kliknij lub przeciągnij zdjęcia i wideo
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, MP4, MOV (maks. 50MB)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handlePortfolioFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview Uploaded Files */}
            {portfolioFiles.length > 0 && (
              <div className="space-y-3">
                {portfolioFiles.map((file, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* File Preview */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {file.type.startsWith('image') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* File Info and Title */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">{file.name}</p>
                        <input
                          type="text"
                          placeholder="Tytuł (opcjonalnie)"
                          value={portfolioTitles[index]}
                          onChange={(e) => updatePortfolioTitle(index, e.target.value)}
                          className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removePortfolioFile(index)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">ℹ️</span>
                <h4 className="text-sm font-medium text-blue-800">
                  Informacja
                </h4>
              </div>
              <p className="text-xs text-blue-700">
                Portfolio możesz później edytować w swoim dashboardzie w zakładce "Portfolio". Możesz dodać więcej zdjęć i wideo w każdej chwili.
              </p>
            </div>
          </div>

          {/* Custom Service Packages Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Twoje Spersonalizowane Pakiety (Opcjonalne)
                </h3>
                <p className="text-gray-500 text-sm">
                  Dodaj własne pakiety usług z cenami, które będą widoczne na Twoim profilu
                </p>
              </div>
              <button
                type="button"
                onClick={addServicePackage}
                className="btn btn-outline btn-sm normal-case text-red-burgundy border-red-burgundy hover:bg-red-burgundy hover:text-white"
              >
                + Dodaj Pakiet
              </button>
            </div>

            {servicePackages.map((pkg, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Pakiet {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeServicePackage(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Usuń
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="label py-1">
                      <span className="label-text text-neutral font-medium text-sm">
                        Nazwa Pakietu *
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input h-10 px-3 w-full rounded-lg bg-white border border-gray-200 focus:border-red-burgundy focus:outline-none"
                      placeholder="np. Mini Social Boost"
                      value={pkg.name}
                      onChange={(e) => updateServicePackage(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label py-1">
                      <span className="label-text text-neutral font-medium text-sm">
                        Cena (PLN) *
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input h-10 px-3 w-full rounded-lg bg-white border border-gray-200 focus:border-red-burgundy focus:outline-none"
                      placeholder="np. 200"
                      value={pkg.price}
                      onChange={(e) => updateServicePackage(index, 'price', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label py-1">
                    <span className="label-text text-neutral font-medium text-sm">
                      Opis Pakietu *
                    </span>
                  </label>
                  <textarea
                    className="textarea h-20 px-3 w-full rounded-lg bg-white border border-gray-200 focus:border-red-burgundy focus:outline-none resize-none"
                    placeholder="Opisz co zawiera ten pakiet... np. 3 x Instagram Stories, Brand tagging + 1 swipe-up link"
                    value={pkg.description}
                    onChange={(e) => updateServicePackage(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}

            {servicePackages.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl">
                <p className="mb-2">🎯 <strong>Żadne pakiety nie zostały jeszcze dodane</strong></p>
                <p>Możesz dodać spersonalizowane pakiety usług później w ustawieniach profilu</p>
              </div>
            )}
          </div>
          
          <div className="form-control mt-5 flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !isValid || uploadingPortfolio}
              className={`btn px-6 py-3 h-auto ${AUTH_CONSTANTS.FORM.BUTTON_WIDTH} font-bold normal-case ${AUTH_CONSTANTS.FORM.BUTTON_RADIUS} border-none shadow-sm transition-all flex items-center justify-center ${
                isSubmitting || !isValid || uploadingPortfolio ? 'bg-red-burgundy/60 cursor-not-allowed' : 'bg-red-burgundy hover:bg-red-burgundy/90'
              }`}
            >
              {isSubmitting || uploadingPortfolio ? (
                <div className="flex items-center justify-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                  <span>{uploadingPortfolio ? 'Uploading portfolio...' : t('buttons.saving')}</span>
                </div>
              ) : (
                <span className="text-white">{t('buttons.saveAndContinue')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
