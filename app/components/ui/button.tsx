import React, { memo } from 'react';
import { cn } from '@/app/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'luxury';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-lumo-500 text-white hover:bg-lumo-600 focus:ring-lumo-500 shadow-soft hover:shadow-medium",
      secondary: "bg-lumo-100 text-lumo-700 hover:bg-lumo-200 focus:ring-lumo-500",
      ghost: "text-lumo-600 hover:bg-lumo-50 hover:text-lumo-700 focus:ring-lumo-500",
      outline: "border border-lumo-300 text-lumo-600 hover:bg-lumo-50 hover:border-lumo-400 focus:ring-lumo-500",
      luxury: "bg-gradient-to-r from-lumo-500 to-lumo-600 text-white hover:from-lumo-600 hover:to-lumo-700 focus:ring-lumo-500 shadow-medium hover:shadow-strong"
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
      md: "px-4 py-2 text-sm rounded-lg gap-2",
      lg: "px-6 py-3 text-base rounded-lg gap-2",
      xl: "px-8 py-4 text-lg rounded-xl gap-3"
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-r-transparent" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

const MemoizedButton = memo(Button);

export { MemoizedButton as Button };
