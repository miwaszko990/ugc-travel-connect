import { ReactNode } from 'react';

interface ModalBackdropProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable modal backdrop component
 * Handles backdrop overlay and click-to-close functionality
 */
export function ModalBackdrop({ 
  isVisible, 
  onClose, 
  children, 
  className = "max-w-md" 
}: ModalBackdropProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal content */}
        <div 
          className={`relative w-full ${className} transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
} 