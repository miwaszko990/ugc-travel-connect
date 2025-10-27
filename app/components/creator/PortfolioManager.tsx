'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/auth';
import { PortfolioItem } from '@/app/lib/types';
import { addPortfolioItem, removePortfolioItem, uploadPortfolioFile } from '@/app/lib/firebase/portfolio';
import { PlusIcon, XMarkIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import PortfolioMasonry from './PortfolioMasonry';

interface PortfolioManagerProps {
  portfolio: PortfolioItem[];
  onUpdate: () => void;
}

export default function PortfolioManager({ portfolio, onUpdate }: PortfolioManagerProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setIsUploading(true);
      
      // Upload the file
      const fileUrl = await uploadPortfolioFile(
        selectedFile,
        user.uid,
        (progress) => setUploadProgress(progress)
      );

      // Determine file type
      const fileType = selectedFile.type.startsWith('video') ? 'video' : 'image';

      // Add portfolio item to Firestore
      await addPortfolioItem(user.uid, {
        type: fileType,
        url: fileUrl,
        title: title || undefined,
        description: description || undefined,
        uploadedAt: new Date().toISOString()
      });

      // Reset form
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl('');
      setTitle('');
      setDescription('');
      setUploadProgress(0);
      
      // Trigger update
      onUpdate();
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      alert('Błąd podczas przesyłania pliku. Spróbuj ponownie.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!user || !confirm('Czy na pewno chcesz usunąć ten element z portfolio?')) return;

    try {
      await removePortfolioItem(user.uid, itemId);
      onUpdate();
    } catch (error) {
      console.error('Error removing portfolio item:', error);
      alert('Błąd podczas usuwania elementu. Spróbuj ponownie.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-text">Moje Portfolio</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 bg-[#8D2D26] text-white px-4 py-2 rounded-xl hover:bg-[#7A2521] transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Dodaj element
        </button>
      </div>

      {/* Portfolio Display */}
      {portfolio.length > 0 ? (
        <div className="relative">
          <PortfolioMasonry items={portfolio} />
          
          {/* Delete buttons overlay - only visible to owner */}
          <div className="absolute inset-0 pointer-events-none">
            {portfolio.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors pointer-events-auto opacity-0 hover:opacity-100"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-3xl">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych elementów w portfolio</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-[#8D2D26] text-white px-6 py-3 rounded-xl hover:bg-[#7A2521] transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Dodaj pierwszy element
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-text">Dodaj element do portfolio</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obraz lub wideo
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#8D2D26] file:text-white
                    hover:file:bg-[#7A2521]
                    file:cursor-pointer cursor-pointer"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {selectedFile?.type.startsWith('video') ? (
                    <video src={previewUrl} className="w-full h-full object-contain" controls />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tytuł (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nazwa projektu lub kampanii"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2D26] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Krótki opis projektu"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2D26] focus:border-transparent"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#8D2D26] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">Przesyłanie: {uploadProgress}%</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 px-6 py-3 bg-[#8D2D26] text-white rounded-xl hover:bg-[#7A2521] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Przesyłanie...' : 'Dodaj do portfolio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

