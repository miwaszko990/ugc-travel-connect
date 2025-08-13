'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { uploadImageToStorage } from '@/app/lib/firebase/utils';
import { AUTH_CONSTANTS } from '@/app/lib/constants/auth';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';

// Lazy load LanguageSwitcher
const LazyIndustrySelect = dynamic(() => import('../../brand/profile-setup/components/IndustrySelect'), {
  ssr: false,
  loading: () => (
    <select className="w-full p-3 border border-gray-300 rounded-xl animate-pulse" disabled>
      <option>Loading...</option>
    </select>
  )
});

// Remove LanguageSwitcher - language persists through URL routing
// const LanguageSwitcher = dynamic(
//   () => import('@/app/components/ui/language-switcher').then(mod => ({ default: mod.LanguageSwitcher })),
//   { 
//     ssr: false,
//     loading: () => <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
//   }
// );

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  instagramHandle: string;
  followerCount: number;
  homeCity: string;
};

interface ProfileFormData {
  firstName: string;
  lastName: string;
  instagramHandle: string;
  followerCount: number;
  homeCity: string;
  profileImageUrl?: string;
  // Add any other fields your form has
}

export default function CreatorProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('creator.profileSetup');
  const locale = useLocale();
  
  // Create form validation schema with translated messages
  const profileSchema = z.object({
    firstName: z.string().min(1, { message: t('fields.firstName.required') }),
    lastName: z.string().min(1, { message: t('fields.lastName.required') }),
    instagramHandle: z.string().min(1, { message: t('fields.instagramHandle.required') }),
    followerCount: z.coerce.number().min(0, { message: t('fields.followerCount.required') }),
    homeCity: z.string().min(1, { message: t('fields.homeCity.required') }),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [instagramPosts, setInstagramPosts] = useState<string[]>(['']);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    instagramHandle: '',
    followerCount: 0,
    homeCity: '',
    profileImageUrl: ''
  });
  
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

  // Load existing profile data if in edit mode
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // First check if profile exists in users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if profile has been set up before
          if (userData.firstName) {
            console.log('Loading existing profile data for editing');
            setIsEditMode(true);
            
            // Populate form fields with existing data
            setValue('firstName', userData.firstName || '');
            setValue('lastName', userData.lastName || '');
            setValue('instagramHandle', userData.instagramHandle || '');
            setValue('followerCount', userData.followerCount || 0);
            setValue('homeCity', userData.homeCity || '');
            
            // Set profile image preview if it exists
            if (userData.profileImageUrl) {
              setImagePreview(userData.profileImageUrl);
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

  // Set focus on the first error field
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof ProfileFormValues;
    if (firstError) {
      setFocus(firstError);
    }
  }, [errors, setFocus]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
    console.log('Valid image selected:', file.name, file.size, file.type);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
  };

  // Open file browser
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Instagram post URL management
  const addInstagramPostField = () => {
    setInstagramPosts([...instagramPosts, '']);
  };

  const removeInstagramPostField = (index: number) => {
    const newPosts = instagramPosts.filter((_, i) => i !== index);
    setInstagramPosts(newPosts.length > 0 ? newPosts : ['']);
  };

  const updateInstagramPost = (index: number, value: string) => {
    const newPosts = [...instagramPosts];
    newPosts[index] = value;
    setInstagramPosts(newPosts);
  };

  const extractPostId = (url: string): { postId: string; type: 'post' | 'reel' } | null => {
    const postPattern = /instagram\.com\/p\/([A-Za-z0-9_-]+)/;
    const reelPattern = /instagram\.com\/reel\/([A-Za-z0-9_-]+)/;
    
    const postMatch = url.match(postPattern);
    if (postMatch) return { postId: postMatch[1], type: 'post' };
    
    const reelMatch = url.match(reelPattern);
    if (reelMatch) return { postId: reelMatch[1], type: 'reel' };
    
    return null;
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (file: File): Promise<string> => {
    if (!file || !user) throw new Error("Missing file or user");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a reference to Firebase Storage
      const storage = getStorage();
    const fileRef = storageRef(storage, `profileImages/${user.uid}/${Date.now()}_${file.name}`);
    
    // Return a properly structured promise
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
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error(t('messages.loginRequired'));
      return;
    }
    
    try {
      console.log('Starting form submission with data:', data);
      
      // Upload image if one was selected
      let imageUrl = null;
      if (imageFile) {
        console.log('Image file selected, starting upload...');
        try {
          imageUrl = await handleImageUpload(imageFile);
          console.log('Image upload successful, URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(t('messages.imageUploadFailed'));
        }
      } else if (imagePreview && !imageFile) {
        // User didn't upload a new image, but had an existing one
        imageUrl = imagePreview;
      }
      
      // Create profile data with ALL fields
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        instagramHandle: data.instagramHandle,
        followerCount: data.followerCount,
        homeCity: data.homeCity,
        profileComplete: true,
        updatedAt: new Date(),
        profileImageUrl: imageUrl // Always include this field
      };
      
      console.log('Final profile data being saved:', profileData);
      
      // Update Firestore (only once!)
      await updateDoc(doc(db, 'users', user.uid), profileData);
      console.log('Profile updated successfully!');
      
      // Save Instagram posts if any were provided
      const validInstagramPosts = instagramPosts.filter(post => post.trim() !== '');
      if (validInstagramPosts.length > 0) {
        console.log('Saving Instagram posts:', validInstagramPosts);
        
        for (const postUrl of validInstagramPosts) {
          const extracted = extractPostId(postUrl);
          if (extracted) {
            try {
              await fetch('/api/instagram/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  creatorId: user.uid,
                  postUrl: postUrl.trim(),
                  postId: extracted.postId,
                  type: extracted.type
                })
              });
            } catch (error) {
              console.error('Error saving Instagram post:', error);
              // Don't fail the entire profile creation for this
            }
          }
        }
      }
      
      toast.success(isEditMode ? t('messages.profileUpdateSuccess') : t('messages.profileCreateSuccess'));
      
      // Navigate to dashboard
      sessionStorage.setItem('profileComplete', 'true');
        router.push(`/${locale}/dashboard/creator`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('messages.profileSaveFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <Spinner size="lg" />
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-neutral mb-2 font-playfair">{t('loading.title')}</h3>
            <p className="text-gray-500 font-inter">{t('loading.subtitle')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className={`bg-white ${AUTH_CONSTANTS.FORM.CARD_RADIUS} shadow-lg p-8 max-w-[600px] w-full`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral mb-2 font-playfair">
              {isEditMode ? t('title.edit') : t('title.create')}
            </h1>
            <p className="text-gray-500 text-sm font-inter">
              {isEditMode ? t('subtitle.edit') : t('subtitle.create')}
            </p>
          </div>
          {/* <LanguageSwitcher /> */}
        </div>
        
        <div className="mb-5"></div>
        
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
                  <p className="text-xs text-gray-500 text-center">{t('fields.profileImage.addPhoto')}</p>
                </div>
              )}
              
              {/* Hidden file input */}
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
                <p className="text-sm text-gray-600">{t('fields.profileImage.uploadProgress', { progress: uploadProgress })}</p>
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
            {/* First Name */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.firstName.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.firstName 
                    ? 'bg-white border-2 border-red-500' 
                    : 'bg-[#F4F4F5] border-0'
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
            
            {/* Last Name */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-neutral font-medium text-sm">{t('fields.lastName.label')}</span>
              </label>
              <input
                type="text"
                className={`input h-12 px-4 w-full rounded-xl font-medium ${
                  errors.lastName 
                    ? 'bg-white border-2 border-red-500' 
                    : 'bg-[#F4F4F5] border-0'
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
          
          {/* Instagram Handle */}
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
                  errors.instagramHandle 
                    ? 'bg-white border-2 border-red-500' 
                    : 'bg-[#F4F4F5] border-0'
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
          
          {/* Instagram Follower Count */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">{t('fields.followerCount.label')}</span>
            </label>
            <input
              type="number"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.followerCount 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
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
          
          {/* Home City */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">{t('fields.homeCity.label')}</span>
            </label>
            <input
              type="text"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.homeCity 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
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

          {/* Instagram Posts Section */}
          <div className="form-control mt-6">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4 rounded-xl">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral">{t('instagramPosts.title')}</h3>
                    <p className="text-sm text-gray-500">{t('instagramPosts.subtitle')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {instagramPosts.map((post, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={post}
                        onChange={(e) => updateInstagramPost(index, e.target.value)}
                        placeholder={t('instagramPosts.placeholder')}
                        className="flex-1 input h-10 px-3 bg-[#F4F4F5] border-0 rounded-lg focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy text-sm"
                      />
                      {instagramPosts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstagramPostField(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('instagramPosts.removeTitle')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addInstagramPostField}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-burgundy hover:text-red-burgundy transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('instagramPosts.addAnother')}
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">{t('instagramPosts.instructions.title')}</p>
                      <p>{t('instagramPosts.instructions.step1')}</p>
                      <p>{t('instagramPosts.instructions.step2')}</p>
                      <p>{t('instagramPosts.instructions.step3')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="form-control mt-5 flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`btn px-6 py-3 h-auto ${AUTH_CONSTANTS.FORM.BUTTON_WIDTH} font-bold normal-case ${AUTH_CONSTANTS.FORM.BUTTON_RADIUS} border-none shadow-sm transition-all flex items-center justify-center ${
                isSubmitting || !isValid
                  ? 'bg-red-burgundy/60 cursor-not-allowed' 
                  : 'bg-red-burgundy hover:bg-red-burgundy/90'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                  <span>{t('buttons.saving')}</span>
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