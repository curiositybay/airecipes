import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    expect(screen.getByText('Welcome to Your Next.js App')).toBeInTheDocument();
  });

  it('has link to examples page', () => {
    render(<HomePage />);
    const examplesLink = screen.getByText('View Examples');
    expect(examplesLink).toBeInTheDocument();
    expect(examplesLink.closest('a')).toHaveAttribute('href', '/examples');
  });

  it('renders contact form', () => {
    render(<HomePage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });
});
