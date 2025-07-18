'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
}

export const ButtonIcon = ({ icon }: { icon: string }) => (
  <i className={`${icon} mr-2`}></i>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg group';

  const variantClasses = {
    primary: 'theme-btn-primary shadow-lg hover:shadow-xl',
    secondary: 'theme-btn-secondary shadow-lg hover:shadow-xl',
    outline:
      'bg-transparent theme-text-icon-primary border-2 theme-border hover:theme-btn-primary',
    ghost:
      'bg-transparent theme-text-secondary hover:theme-bg-surface-hover hover:theme-text-primary',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <ButtonIcon icon={icon} />}
      {children}
    </button>
  );
};

export const PrimaryButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center theme-text-button px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base theme-btn-primary group ${className}`}
      {...props}
    >
      {icon && <ButtonIcon icon={icon} />}
      {children}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center theme-text-button px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base theme-btn-secondary group ${className}`}
      {...props}
    >
      {icon && <ButtonIcon icon={icon} />}
      {children}
    </button>
  );
};
