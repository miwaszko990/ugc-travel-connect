'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { PortfolioItem } from '@/app/lib/types';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/solid';

interface PortfolioMasonryProps {
  items: PortfolioItem[];
}

export default function PortfolioMasonry({ items }: PortfolioMasonryProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Generate consistent varied heights for Pinterest-style layout
  const itemHeights = useMemo(() => {
    // More varied heights for true Pinterest effect (in percentage)
    const heights = [75, 130, 90, 150, 65, 110, 85, 140, 95, 120, 70, 100, 125, 80, 145];
    return items.map((item, index) => heights[index % heights.length]);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Brak pozycji w portfolio</p>
      </div>
    );
  }

  // Pinterest-style masonry layout using CSS columns
  return (
    <>
      <div className="columns-2 lg:columns-3 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="break-inside-avoid mb-4 group cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              {item.type === 'image' ? (
                <div className="relative w-full" style={{ paddingBottom: `${itemHeights[index]}%` }}>
                  <Image
                    src={item.url}
                    alt={item.title || 'Portfolio item'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="relative w-full" style={{ paddingBottom: `${itemHeights[index]}%` }}>
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title || 'Video thumbnail'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <PlayIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PlayIcon className="h-8 w-8 text-[#8D2D26] ml-1" />
                    </div>
                  </div>
                </div>
              )}
              
              {item.title && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>

          <div
            className="max-w-7xl max-h-[90vh] w-full relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === 'image' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title || 'Portfolio item'}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-white text-center p-8';
                    errorDiv.innerHTML = '<p class="text-xl mb-2">⚠️ Nie można załadować obrazu</p><p class="text-sm text-gray-400">Obraz może być niedostępny</p>';
                    target.parentElement?.appendChild(errorDiv);
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center rounded-lg overflow-hidden">
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] w-auto h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-white text-center p-8';
                    errorDiv.innerHTML = '<p class="text-xl mb-2">⚠️ Nie można załadować wideo</p><p class="text-sm text-gray-400">Wideo może być niedostępne</p>';
                    target.parentElement?.appendChild(errorDiv);
                  }}
                >
                  Twoja przeglądarka nie obsługuje odtwarzania wideo.
                </video>
              </div>
            )}

            {(selectedItem.title || selectedItem.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg">
                {selectedItem.title && (
                  <h3 className="text-xl font-semibold mb-2">{selectedItem.title}</h3>
                )}
                {selectedItem.description && (
                  <p className="text-sm text-gray-300">{selectedItem.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

