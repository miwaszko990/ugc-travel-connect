'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Upload, File, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { uploadDeliveryFiles, saveOrderDelivery } from '@/app/lib/firebase/delivery';
import { toast } from 'react-hot-toast';

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  uploaded: boolean;
  error?: string;
  url?: string;
}

interface FileDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  brandName: string;
  onSuccess: () => void;
}

export default function FileDeliveryModal({
  isOpen,
  onClose,
  orderId,
  brandName,
  onSuccess
}: FileDeliveryModalProps) {
  const t = useTranslations('creator.fileDelivery');
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [noteToBrand, setNoteToBrand] = useState('');
  const [externalLinks, setExternalLinks] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'application/pdf', 'application/zip',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ];

    if (file.size > maxSize) {
      return t('validation.fileTooLarge');
    }

    if (!allowedTypes.includes(file.type)) {
      return t('validation.fileTypeNotAllowed');
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithProgress[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (!error) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          progress: 0,
          uploaded: false
        });
      } else {
        toast.error(`${file.name}: ${error}`);
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [t]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [handleFiles]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle delivery submission
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error(t('validation.noFiles'));
      return;
    }

    setIsUploading(true);
    try {
      // Upload files to Firebase Storage
      const uploadedFiles = await uploadDeliveryFiles(
        files.map(f => f.file),
        orderId,
        (fileIndex, progress) => {
          setFiles(prev => prev.map((f, index) => 
            index === fileIndex ? { ...f, progress } : f
          ));
        }
      );

      // Update files with uploaded URLs
      setFiles(prev => prev.map((f, index) => ({
        ...f,
        uploaded: true,
        url: uploadedFiles[index]?.url,
        progress: 100
      })));

      // Save delivery data to Firestore
      await saveOrderDelivery(orderId, {
        files: uploadedFiles,
        noteToBrand: noteToBrand.trim() || undefined,
        externalLinks: externalLinks.trim() || undefined,
        deliveredAt: new Date(),
        status: 'delivered'
      });

      toast.success(t('success.materialsDelivered'));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('File delivery failed:', error);
      toast.error(t('errors.deliveryFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-[20px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-[20px] border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-semibold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-500">{t('subtitle', { brandName })}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isUploading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {t('sections.files')} <span className="text-red-500">*</span>
              </label>
              
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[16px] p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-red-burgundy bg-red-burgundy/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('dropzone.title')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('dropzone.subtitle')}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-red-burgundy text-white px-6 py-2 rounded-[12px] hover:bg-red-burgundy/90 transition-colors"
                  disabled={isUploading}
                >
                  {t('dropzone.selectFiles')}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  {t('dropzone.supportedTypes')}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.zip,.ppt,.pptx"
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {t('fileList.title')} ({files.length})
                </h4>
                <div className="space-y-3">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="bg-gray-50 rounded-[12px] p-4 flex items-center gap-4"
                    >
                      <File className="w-8 h-8 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 truncate">
                            {fileItem.file.name}
                          </h5>
                          <span className="text-sm text-gray-500">
                            {formatFileSize(fileItem.file.size)}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-burgundy h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {fileItem.uploaded
                              ? t('fileList.uploaded')
                              : isUploading
                              ? `${fileItem.progress}%`
                              : t('fileList.ready')
                            }
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isUploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note to Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('sections.noteToBrand')}
              </label>
              <textarea
                value={noteToBrand}
                onChange={(e) => setNoteToBrand(e.target.value)}
                placeholder={t('placeholders.noteToBrand')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy resize-none"
                disabled={isUploading}
              />
            </div>

            {/* External Links */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                {t('sections.externalLinks')}
              </label>
              <textarea
                value={externalLinks}
                onChange={(e) => setExternalLinks(e.target.value)}
                placeholder={t('placeholders.externalLinks')}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy resize-none"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('hints.externalLinks')}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-[12px] hover:bg-gray-200 transition-colors"
                disabled={isUploading}
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={files.length === 0 || isUploading}
                className="px-6 py-2 bg-red-burgundy text-white rounded-[12px] hover:bg-red-burgundy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent" />
                    {t('actions.uploading')}
                  </>
                ) : (
                  t('actions.sendForApproval')
                )}
              </button>
            </div>

            {/* Validation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t('info.title')}</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• {t('info.maxFileSize')}</li>
                    <li>• {t('info.supportedFormats')}</li>
                    <li>• {t('info.deliveryProcess')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 