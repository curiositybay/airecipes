import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleButton } from './ToggleButton';

describe('ToggleButton Component', () => {
  it('renders with icon', () => {
    render(<ToggleButton icon='fas fa-sun' />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('i')).toHaveClass(
      'fas',
      'fa-sun'
    );
  });

  it('renders with children', () => {
    render(<ToggleButton>Toggle Me</ToggleButton>);
    expect(screen.getByText('Toggle Me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ToggleButton onClick={handleClick} icon='fas fa-sun' />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct size classes', () => {
    render(<ToggleButton size='sm' icon='fas fa-sun' />);
    expect(screen.getByRole('button')).toHaveClass('p-2');
  });

  it('applies correct variant classes', () => {
    render(<ToggleButton variant='secondary' icon='fas fa-sun' />);
    expect(screen.getByRole('button')).toHaveClass('theme-btn-secondary');
  });

  it('applies aria-label and title', () => {
    render(
      <ToggleButton
        icon='fas fa-sun'
        ariaLabel='Toggle theme'
        title='Toggle theme'
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Toggle theme'
    );
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Toggle theme');
  });

  it('can be disabled', () => {
    render(<ToggleButton disabled icon='fas fa-sun' />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<ToggleButton className='custom-class' icon='fas fa-sun' />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
