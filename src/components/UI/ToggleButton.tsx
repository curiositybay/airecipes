'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';

export interface ToggleButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export const ToggleButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ariaLabel,
  title,
  ...props
}: ToggleButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg group cursor-pointer';

  const variantClasses = {
    primary: 'theme-btn-primary shadow-lg hover:shadow-xl',
    secondary: 'theme-btn-secondary shadow-lg hover:shadow-xl',
    outline:
      'bg-transparent theme-text-icon-primary border-2 theme-border hover:theme-btn-primary',
    ghost:
      'bg-transparent theme-text-secondary hover:theme-bg-surface-hover hover:theme-text-primary',
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      title={title}
      {...props}
    >
      {icon && <i className={`${icon} ${iconSizeClasses[size]}`}></i>}
      {children}
    </button>
  );
};
