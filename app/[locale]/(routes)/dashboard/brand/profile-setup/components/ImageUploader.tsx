import React from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  imagePreview: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
}

export default function ImageUploader({
  imagePreview,
  isUploading,
  uploadProgress,
  onImageClick,
  onImageChange,
  fileInputRef,
  t
}: ImageUploaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div 
        onClick={onImageClick}
        className="relative w-32 h-32 rounded-xl border-2 border-dashed border-red-burgundy/30 bg-red-burgundy/5 cursor-pointer hover:border-red-burgundy/50 hover:bg-red-burgundy/10 transition-colors flex items-center justify-center"
      >
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Brand logo preview"
            fill
            className="object-cover rounded-xl"
            sizes="128px"
          />
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">🏢</div>
            <span className="text-sm text-gray-500">{t('form.logoUpload.addLogo')}</span>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
        aria-label={t('form.logoUpload.selectImage')}
      />
      
      {isUploading && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('form.logoUpload.uploadProgress').replace('{progress}', uploadProgress.toString())}
          </p>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-burgundy h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

