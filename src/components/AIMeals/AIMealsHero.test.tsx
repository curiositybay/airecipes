import React from 'react';
import { render, screen } from '@testing-library/react';
import AIMealsHero from './AIMealsHero';

// Mock dependencies
jest.mock('../UI/AuthControls', () => {
  return function MockAuthControls() {
    return <div data-testid='auth-controls'>Auth Controls</div>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    return (
      <div
        data-testid='ai-recipes-logo'
        data-src={src}
        data-alt={alt}
        {...props}
      />
    );
  };
});

describe('AIMealsHero', () => {
  it('should render the hero section', () => {
    render(<AIMealsHero />);

    expect(
      screen.getByText('AI Recipe Generator by Curiosity Bay')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Turn your ingredients into delicious meals/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
  });

  it('should display the logo image', () => {
    render(<AIMealsHero />);

    const logoImage = screen.getByTestId('ai-recipes-logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('data-src', '/airecipes.png');
    expect(logoImage).toHaveAttribute('data-alt', 'AI Recipes Logo');
  });

  it('should have the correct CSS classes', () => {
    render(<AIMealsHero />);

    const heroSection = document.querySelector('.ai-meals-hero');
    expect(heroSection).toHaveClass(
      'bg-gradient-to-br',
      'from-slate-50',
      'via-white',
      'to-slate-100',
      'relative'
    );
  });
});
