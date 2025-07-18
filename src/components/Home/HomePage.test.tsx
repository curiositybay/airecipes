import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    expect(screen.getByText('Welcome to Your Next.js App')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    expect(screen.getByText('Modern Stack')).toBeInTheDocument();
    expect(screen.getByText('Beautiful UI')).toBeInTheDocument();
    expect(screen.getByText('Ready to Deploy')).toBeInTheDocument();
  });

  it('has link to examples page', () => {
    render(<HomePage />);
    const examplesLink = screen.getByText('View Examples');
    expect(examplesLink).toBeInTheDocument();
    expect(examplesLink.closest('a')).toHaveAttribute('href', '/examples');
  });
});
