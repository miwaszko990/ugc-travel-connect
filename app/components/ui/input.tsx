'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'luxury';
  error?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'default',
    error,
    success,
    icon,
    label,
    helperText,
    ...props 
  }, ref) => {
    const baseStyles = "w-full px-4 py-3 text-sm transition-all duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      default: "bg-white border border-neutral-300 rounded-lg focus:border-lumo-500 focus:ring-lumo-500/20",
      luxury: "bg-gradient-to-r from-white to-neutral-50 border border-neutral-200 rounded-xl shadow-soft focus:border-lumo-500 focus:ring-lumo-500/20 focus:shadow-medium"
    };
    
    const stateStyles = error 
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
      : success
      ? "border-green-300 focus:border-green-500 focus:ring-green-500/20" 
      : "";
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              baseStyles,
              variants[variant],
              stateStyles,
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {helperText && (
          <p className={cn(
            "mt-2 text-xs",
            error ? "text-red-600" : success ? "text-green-600" : "text-neutral-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input }; // review trigger
