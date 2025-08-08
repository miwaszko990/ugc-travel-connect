import { memo } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  imagePreview: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string, params?: Record<string, number | string>) => string;
}

const ImageUploader = memo(function ImageUploader({
  imagePreview,
  isUploading,
  uploadProgress,
  onImageClick,
  onImageChange,
  fileInputRef,
  t
}: ImageUploaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      <div 
        onClick={onImageClick}
        className="relative w-32 h-32 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-red-burgundy/30 flex items-center justify-center bg-red-burgundy/5 hover:bg-red-burgundy/10 transition-colors"
      >
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Brand logo preview"
            fill
            style={{ objectFit: 'cover' }}
            priority={false}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            sizes="(max-width: 128px) 100vw, 128px"
          />
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-burgundy/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-xs mt-2 text-red-burgundy">{t('form.logoUpload.addLogo')}</p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {isUploading && (
        <div className="text-center mt-2">
          <p className="text-red-burgundy text-sm">{t('form.logoUpload.uploadProgress', { progress: uploadProgress })}</p>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-red-burgundy h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ImageUploader; 