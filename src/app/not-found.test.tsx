import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

// Mock dependencies
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));
jest.mock('@/components/UI/Button', () => ({
  PrimaryButton: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  SecondaryButton: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'TestApp',
    errorMessages: {
      notFound: 'Test not found message.',
    },
  },
}));

describe('NotFound', () => {
  it('renders the 404 error code and title', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders the not found error message from appConfig', () => {
    render(<NotFound />);
    expect(screen.getByText('Test not found message.')).toBeInTheDocument();
  });

  it('renders the Return to {appConfig.name} button with correct link', () => {
    render(<NotFound />);
    const returnButton = screen.getByRole('button', {
      name: /Return to TestApp/i,
    });
    const link = screen.getByRole('link', { name: /Return to TestApp/i });
    expect(returnButton).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders the Return to TestApp button with correct link', () => {
    render(<NotFound />);
    const returnButton = screen.getByRole('button', {
      name: /Return to TestApp/i,
    });
    const link = screen.getByRole('link', { name: /Return to TestApp/i });
    expect(returnButton).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
