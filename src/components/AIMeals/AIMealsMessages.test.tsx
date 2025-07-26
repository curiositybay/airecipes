import React from 'react';
import { render, screen } from '@testing-library/react';
import AIMealsMessages from './AIMealsMessages';

describe('AIMealsMessages', () => {
  const defaultProps = {
    error: '',
    isFallbackRecipes: false,
    fallbackMessage: '',
  };

  it('should render nothing when no messages are present', () => {
    render(<AIMealsMessages {...defaultProps} />);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fallback/i)).not.toBeInTheDocument();
  });

  it('should display error message when error is provided', () => {
    const errorMessage = 'Test error message';
    render(<AIMealsMessages {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('ai-meals-error');
  });

  it('should display fallback message when isFallbackRecipes is true', () => {
    const fallbackMessage = 'AI service is temporarily unavailable';
    render(
      <AIMealsMessages
        {...defaultProps}
        isFallbackRecipes={true}
        fallbackMessage={fallbackMessage}
      />
    );

    expect(screen.getByText(fallbackMessage)).toBeInTheDocument();
    expect(screen.getByText(fallbackMessage)).toHaveClass('ai-meals-fallback');
  });

  it('should display both error and fallback messages when both are present', () => {
    const errorMessage = 'Test error message';
    const fallbackMessage = 'AI service is temporarily unavailable';

    render(
      <AIMealsMessages
        {...defaultProps}
        error={errorMessage}
        isFallbackRecipes={true}
        fallbackMessage={fallbackMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(fallbackMessage)).toBeInTheDocument();
  });

  it('should display error icon when error is present', () => {
    render(<AIMealsMessages {...defaultProps} error='Test error' />);

    const errorIcon = document.querySelector('.fa-exclamation-triangle');
    expect(errorIcon).toBeInTheDocument();
  });

  it('should display info icon when fallback message is present', () => {
    render(
      <AIMealsMessages
        {...defaultProps}
        isFallbackRecipes={true}
        fallbackMessage='Test fallback'
      />
    );

    const infoIcon = document.querySelector('.fa-info-circle');
    expect(infoIcon).toBeInTheDocument();
  });

  it('should not display fallback message when isFallbackRecipes is false', () => {
    const fallbackMessage = 'AI service is temporarily unavailable';
    render(
      <AIMealsMessages
        {...defaultProps}
        isFallbackRecipes={false}
        fallbackMessage={fallbackMessage}
      />
    );

    expect(screen.queryByText(fallbackMessage)).not.toBeInTheDocument();
  });
});
