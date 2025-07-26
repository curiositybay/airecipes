import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AIMealsActions from './AIMealsActions';

// Mock dependencies
jest.mock('../UI/Button', () => ({
  PrimaryButton: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid='primary-button'
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={className}
      data-testid='secondary-button'
    >
      {children}
    </button>
  ),
}));

describe('AIMealsActions', () => {
  const defaultProps = {
    onGetRecipes: jest.fn(),
    onSurpriseMe: jest.fn(),
    onClearAll: jest.fn(),
    isLoading: false,
    hasContent: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all action buttons', () => {
    render(<AIMealsActions {...defaultProps} />);

    expect(screen.getByText('Get Recipes')).toBeInTheDocument();
    expect(screen.getByText('Surprise Me')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should call onGetRecipes when Get Recipes button is clicked', () => {
    render(<AIMealsActions {...defaultProps} />);

    fireEvent.click(screen.getByText('Get Recipes'));
    expect(defaultProps.onGetRecipes).toHaveBeenCalledTimes(1);
  });

  it('should call onSurpriseMe when Surprise Me button is clicked', () => {
    render(<AIMealsActions {...defaultProps} />);

    fireEvent.click(screen.getByText('Surprise Me'));
    expect(defaultProps.onSurpriseMe).toHaveBeenCalledTimes(1);
  });

  it('should call onClearAll when Clear All button is clicked', () => {
    render(<AIMealsActions {...defaultProps} hasContent={true} />);

    fireEvent.click(screen.getByText('Clear All'));
    expect(defaultProps.onClearAll).toHaveBeenCalledTimes(1);
  });

  it('should disable Get Recipes button when loading', () => {
    render(<AIMealsActions {...defaultProps} isLoading={true} />);

    const getRecipesButton = screen.getByTestId('primary-button');
    expect(getRecipesButton).toBeDisabled();
  });

  it('should show loading text when isLoading is true', () => {
    render(<AIMealsActions {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Generating Recipes...')).toBeInTheDocument();
  });

  it('should show normal text when isLoading is false', () => {
    render(<AIMealsActions {...defaultProps} isLoading={false} />);

    expect(screen.getByText('Get Recipes')).toBeInTheDocument();
  });

  it('should disable Clear All button when hasContent is false', () => {
    render(<AIMealsActions {...defaultProps} hasContent={false} />);

    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toBeDisabled();
  });

  it('should enable Clear All button when hasContent is true', () => {
    render(<AIMealsActions {...defaultProps} hasContent={true} />);

    const clearButton = screen.getByText('Clear All');
    expect(clearButton).not.toBeDisabled();
  });

  it('should display the trash icon in Clear All button', () => {
    render(<AIMealsActions {...defaultProps} />);

    const trashIcon = document.querySelector('.fa-trash');
    expect(trashIcon).toBeInTheDocument();
  });
});
