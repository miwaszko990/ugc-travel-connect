import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  className?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-neutral font-medium text-sm">{label}</span>
        </label>
        <input
          ref={ref}
          className={`input h-12 px-4 w-full rounded-xl font-medium ${
            error 
              ? 'bg-white border-2 border-red-500' 
              : 'bg-[#F4F4F5] border-0'
          } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy ${className}`}
          {...props}
        />
        {error && (
          <label className="label py-0.5">
            <span className="label-text-alt text-error text-xs">{error.message}</span>
          </label>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField'; 