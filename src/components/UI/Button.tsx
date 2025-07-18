'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { getTheme } from '@/config/theme';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  theme?: string;
}

export interface ButtonIconProps {
  icon: string;
  className?: string;
}

export const ButtonIcon = ({ icon, className = '' }: ButtonIconProps) => {
  return (
    <i
      className={`fas ${icon} mr-2 transition-transform duration-300 group-hover:scale-110 ${className}`}
    ></i>
  );
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  theme = 'ocean',
  ...props
}: ButtonProps) => {
  const themeConfig = getTheme(theme);

  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg group';

  const variantClasses = {
    primary: `${themeConfig.colors.primary} ${themeConfig.colors.primaryHover} text-white shadow-lg hover:shadow-xl`,
    secondary: `${themeConfig.colors.secondary} ${themeConfig.colors.secondaryHover} text-white shadow-lg hover:shadow-xl`,
    outline:
      'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800',
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
  theme = 'ocean',
  ...props
}: ButtonProps) => {
  const themeConfig = getTheme(theme);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base ${themeConfig.colors.primary} ${themeConfig.colors.primaryHover} group ${className}`}
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
  theme = 'ocean',
  ...props
}: ButtonProps) => {
  const themeConfig = getTheme(theme);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base ${themeConfig.colors.secondary} ${themeConfig.colors.secondaryHover} group ${className}`}
      {...props}
    >
      {icon && <ButtonIcon icon={icon} />}
      {children}
    </button>
  );
};

const ButtonComponents = {
  Button,
  PrimaryButton,
  SecondaryButton,
  ButtonIcon,
};

export default ButtonComponents;
