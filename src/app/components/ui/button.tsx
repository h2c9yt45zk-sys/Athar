import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  let variantStyles = 'bg-brand-burgundy text-white hover:bg-black';
  if (variant === 'outline') {
    variantStyles = 'border border-outline-variant text-on-surface hover:bg-brand-burgundy hover:text-white';
  } else if (variant === 'ghost') {
    variantStyles = 'text-on-surface hover:text-brand-burgundy';
  } else if (variant === 'link') {
    variantStyles = 'text-brand-gold underline hover:text-brand-burgundy';
  }

  return (
    <button
      className={`px-8 py-3 rounded-full font-label-md transition-colors duration-300 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
