'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/app/hooks/useAuth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { uploadImageToStorage } from '@/app/lib/firebase/utils';

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  instagramHandle: z.string().min(1, { message: 'Instagram handle is required' }),
  followerCount: z.coerce.number().min(0, { message: 'Follower count must be at least 0' }),
  homeCity: z.string().min(1, { message: 'Home city is required' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
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
        toast.error('Please select an image file');
        return;
      }
      
    // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
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
      toast.error('You must be logged in to create a profile');
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
          toast.error('Failed to upload profile image.');
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
      toast.success(isEditMode ? 'Profile updated successfully!' : 'Profile created successfully!');
      
      // Navigate to dashboard
      sessionStorage.setItem('profileComplete', 'true');
        router.push('/dashboard/creator');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12 px-4">
      <div className="max-w-[500px] mx-auto bg-white rounded-[24px] shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2 font-playfair">
          {isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}
        </h1>
        <p className="text-gray-500 text-center mb-8 font-inter">
          {isEditMode ? 'Update your creator profile details' : 'Set up your creator profile to get started'}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-inter">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-8">
            <div 
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs mt-2">Add photo</p>
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
                <p>Uploading: {uploadProgress}%</p>
                <progress 
                  className="progress progress-primary w-full" 
                  value={uploadProgress} 
                  max="100"
                ></progress>
              </div>
            )}
          </div>
          
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#204A38]/20'
                }`}
                placeholder="John"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-red-500 text-xs">{errors.firstName.message}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#204A38]/20'
                }`}
                placeholder="Smith"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-red-500 text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          {/* Instagram Handle */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                className={`w-full p-3 pl-8 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.instagramHandle ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#204A38]/20'
                }`}
                placeholder="your_username"
                {...register('instagramHandle')}
              />
            </div>
            {errors.instagramHandle && (
              <p className="mt-1 text-red-500 text-xs">{errors.instagramHandle.message}</p>
            )}
          </div>
          
          {/* Instagram Follower Count */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Follower Count</label>
            <input
              type="number"
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.followerCount ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#204A38]/20'
              }`}
              placeholder="1000"
              {...register('followerCount')}
            />
            {errors.followerCount && (
              <p className="mt-1 text-red-500 text-xs">{errors.followerCount.message}</p>
            )}
          </div>
          
          {/* Home City */}
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lives in</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.homeCity ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#204A38]/20'
              }`}
              placeholder="New York"
              {...register('homeCity')}
            />
            {errors.homeCity && (
              <p className="mt-1 text-red-500 text-xs">{errors.homeCity.message}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-[#204A38] hover:bg-[#204A38]/90 text-white py-3 px-4 rounded-xl mt-6 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" color="secondary" className="mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              'Save and Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 