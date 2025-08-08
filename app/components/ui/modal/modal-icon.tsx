import { ReactNode } from 'react';

interface ModalIconProps {
  children: ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
  className?: string;
}

/**
 * Reusable modal icon component with theme variants
 */
export function ModalIcon({ 
  children, 
  variant = 'info', 
  className = "" 
}: ModalIconProps) {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    success: 'bg-green-100 text-green-600'
  };

  return (
    <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
} 