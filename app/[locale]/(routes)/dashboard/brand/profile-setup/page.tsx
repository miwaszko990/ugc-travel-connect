'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/app/hooks/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Form validation schema for brand
const brandProfileSchema = z.object({
  brandName: z.string().min(1, { message: 'Brand name is required' }),
  instagramHandle: z.string().min(1, { message: 'Instagram handle is required' }),
  website: z.string().url({ message: 'Please enter a valid website URL' }).optional().or(z.literal('')),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
});

type BrandProfileFormValues = z.infer<typeof brandProfileSchema>;

interface BrandProfileFormData {
  brandName: string;
  instagramHandle: string;
  website?: string;
  description: string;
  industry: string;
  location: string;
  profileImageUrl?: string;
}

export default function BrandProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
      } catch (error) {
        console.error('Error loading brand profile data:', error);
        setLoading(false);
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

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
      
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
      
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
      
    console.log('Valid brand logo selected:', file.name, file.size, file.type);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Open file browser
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (file: File): Promise<string> => {
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
  };

  // Handle form submission
  const onSubmit = async (data: BrandProfileFormValues) => {
    if (!user) {
      toast.error('You must be logged in to create a brand profile');
      return;
    }
    
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
          toast.error('Failed to upload brand logo.');
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
      await updateDoc(doc(db, 'users', user.uid), brandProfileData);
      console.log('Brand profile updated successfully!');
      toast.success(isEditMode ? 'Brand profile updated successfully!' : 'Brand profile created successfully!');
      
      // Navigate to brand dashboard
      sessionStorage.setItem('profileComplete', 'true');
      router.push('/dashboard/brand');
    } catch (error) {
      console.error('Error updating brand profile:', error);
      toast.error('Failed to update brand profile. Please try again.');
    }
  };

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
      <div className="max-w-[600px] mx-auto bg-white rounded-[24px] shadow-lg p-8">
        <h1 className="text-3xl font-serif font-bold text-center mb-2 text-red-burgundy">
          {isEditMode ? 'Edit Brand Profile' : 'Create Brand Profile'}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {isEditMode ? 'Update your brand profile details' : 'Set up your brand profile to start collaborating with creators'}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand Logo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div 
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-red-burgundy/30 flex items-center justify-center bg-red-burgundy/5 hover:bg-red-burgundy/10 transition-colors"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Brand logo preview"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-burgundy/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-xs mt-2 text-red-burgundy">Add logo</p>
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
                <p className="text-red-burgundy text-sm">Uploading: {uploadProgress}%</p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-red-burgundy h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Brand Name */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.brandName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              placeholder="Acme Travel Co."
              {...register('brandName')}
            />
            {errors.brandName && (
              <p className="mt-1 text-red-500 text-xs">{errors.brandName.message}</p>
            )}
          </div>
          
          {/* Instagram Handle */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Handle *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                className={`w-full p-3 pl-8 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.instagramHandle ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
                }`}
                placeholder="your_brand"
                {...register('instagramHandle')}
              />
            </div>
            {errors.instagramHandle && (
              <p className="mt-1 text-red-500 text-xs">{errors.instagramHandle.message}</p>
            )}
          </div>
          
          {/* Website */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.website ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              placeholder="https://www.yourbrand.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="mt-1 text-red-500 text-xs">{errors.website.message}</p>
            )}
          </div>
          
          {/* Industry */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
            <select
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.industry ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              {...register('industry')}
            >
              <option value="">Select your industry</option>
              <option value="Travel & Tourism">Travel & Tourism</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Fitness & Wellness">Fitness & Wellness</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
            {errors.industry && (
              <p className="mt-1 text-red-500 text-xs">{errors.industry.message}</p>
            )}
          </div>
          
          {/* Location */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              placeholder="New York, NY"
              {...register('location')}
            />
            {errors.location && (
              <p className="mt-1 text-red-500 text-xs">{errors.location.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Description *</label>
            <textarea
              rows={4}
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-burgundy/20 focus:border-red-burgundy'
              }`}
              placeholder="Tell creators about your brand, what you do, and what kind of content you're looking for..."
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
                <span>Saving...</span>
              </>
            ) : (
              isEditMode ? 'Update Profile' : 'Save and Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}// review trigger
