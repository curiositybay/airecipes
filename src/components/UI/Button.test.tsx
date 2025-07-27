import { render, screen, fireEvent } from '@testing-library/react';
import { PrimaryButton, SecondaryButton, Button, ButtonIcon } from './Button';

describe('Button Component', () => {
  describe('PrimaryButton', () => {
    it('renders with correct text', () => {
      render(<PrimaryButton>Click me</PrimaryButton>);
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<PrimaryButton onClick={handleClick}>Click me</PrimaryButton>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<PrimaryButton disabled>Click me</PrimaryButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders with icon', () => {
      render(<PrimaryButton icon='fa-home'>Home</PrimaryButton>);
      expect(screen.getByRole('button').querySelector('i')).toBeInTheDocument();
    });

    it('renders with submit type', () => {
      render(<PrimaryButton type='submit'>Submit</PrimaryButton>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('applies custom className', () => {
      render(<PrimaryButton className='custom-class'>Button</PrimaryButton>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      render(<PrimaryButton data-testid='custom-button'>Button</PrimaryButton>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('SecondaryButton', () => {
    it('renders with correct text', () => {
      render(<SecondaryButton>Click me</SecondaryButton>);
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<SecondaryButton onClick={handleClick}>Click me</SecondaryButton>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<SecondaryButton disabled>Click me</SecondaryButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders with icon', () => {
      render(<SecondaryButton icon='fa-star'>Star</SecondaryButton>);
      expect(screen.getByRole('button').querySelector('i')).toBeInTheDocument();
    });
  });

  describe('Button variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant='primary'>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant='secondary'>Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders outline variant correctly', () => {
      render(<Button variant='outline'>Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant='ghost'>Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Button sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size='sm'>Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders medium size correctly', () => {
      render(<Button size='md'>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      render(<Button size='lg'>Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Button with icons', () => {
    it('renders with icon', () => {
      render(<Button icon='fa-heart'>Love</Button>);
      expect(screen.getByRole('button').querySelector('i')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      render(<Button>No Icon</Button>);
      const button = screen.getByRole('button');
      expect(button.querySelector('i')).not.toBeInTheDocument();
    });
  });

  describe('ButtonIcon component', () => {
    it('renders with correct icon class', () => {
      render(<ButtonIcon icon='fa-user' />);
      const icon = document.querySelector('i');
      expect(icon).toHaveClass('fa-user', 'mr-2');
    });
  });

  describe('Button interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<Button className='custom-button'>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-button');
    });

    it('passes through additional props', () => {
      render(
        <Button data-testid='test-button' aria-label='Test'>
          Button
        </Button>
      );
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('aria-label', 'Test');
    });
  });
});
