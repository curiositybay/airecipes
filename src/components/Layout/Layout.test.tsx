import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('./Footer', () => {
  const MockFooter = () => <div data-testid='footer' />;
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});

jest.mock('@/components/UI/GitHubCorner', () => {
  const MockGitHubCorner = () => <div data-testid='github-corner' />;
  MockGitHubCorner.displayName = 'MockGitHubCorner';
  return MockGitHubCorner;
});

// Remove the unused mock components
describe('Layout', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('renders children inside main', () => {
    renderWithTheme(
      <Layout>
        <div data-testid='child'>Test Child</div>
      </Layout>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders Footer and GitHubCorner', () => {
    renderWithTheme(
      <Layout>
        <div>Child</div>
      </Layout>
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('github-corner')).toBeInTheDocument();
  });

  it('renders wrapper div with correct classes', () => {
    renderWithTheme(
      <Layout>
        <div>Child</div>
      </Layout>
    );
    const wrapper = screen.getByTestId('layout-wrapper');
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
  });
});

// Patch Layout.tsx to add data-testid to the wrapper div for robust testing
