import React from 'react';
import { render, screen } from '@testing-library/react';
import AIMealsHero from './AIMealsHero';

// Mock dependencies
jest.mock('../UI/AuthControls', () => {
  return function MockAuthControls() {
    return <div data-testid='auth-controls'>Auth Controls</div>;
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

  it('should display the correct icons', () => {
    render(<AIMealsHero />);

    const robotIcon = document.querySelector('.fa-robot');
    const utensilsIcon = document.querySelector('.fa-utensils');

    expect(robotIcon).toBeInTheDocument();
    expect(utensilsIcon).toBeInTheDocument();
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
