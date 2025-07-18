import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';
import LoadingSpinnerDefault from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-6',
      'h-6'
    );
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size='sm' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with medium size', () => {
    render(<LoadingSpinner size='md' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size='lg' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className='custom-spinner' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('combines custom className with default classes', () => {
    render(<LoadingSpinner size='lg' className='custom-spinner' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-8',
      'h-8',
      'custom-spinner'
    );
  });

  it('has correct default size when no size prop is provided', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('has correct default className when no className prop is provided', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600'
    );
  });

  it('renders with both size and className explicitly provided', () => {
    render(<LoadingSpinner size='sm' className='my-custom-class' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-4', 'h-4', 'my-custom-class');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600'
    );
  });

  it('renders with empty className', () => {
    render(<LoadingSpinner className='' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-6',
      'h-6'
    );
  });

  it('renders with all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);
      const spinner = screen.getByTestId('loading-spinner');
      const expectedSize =
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8';
      expect(spinner).toHaveClass(...expectedSize.split(' '));
      unmount();
    });
  });

  it('renders with undefined props', () => {
    render(<LoadingSpinner size={undefined} className={undefined} />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-6',
      'h-6'
    );
  });

  it('renders with default export', () => {
    render(<LoadingSpinnerDefault />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-6',
      'h-6'
    );
  });

  it('renders with default export and custom props', () => {
    render(<LoadingSpinnerDefault size='lg' className='custom-class' />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'border-2',
      'border-gray-300',
      'border-t-blue-600',
      'w-8',
      'h-8',
      'custom-class'
    );
  });
});
