import React from 'react';
import { render, screen } from '@testing-library/react';
import UnderConstructionClient from './UnderConstructionClient';

// Mock the VersionDisplay component.
jest.mock('./VersionDisplay', () => {
  return function MockVersionDisplay() {
    return <div data-testid='version-display'>Version Display</div>;
  };
});

describe('UnderConstructionClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct app name', () => {
    render(<UnderConstructionClient appName='TestApp' />);

    expect(
      screen.getByText('TestApp is under construction')
    ).toBeInTheDocument();
  });

  it('renders helmet icon', () => {
    render(<UnderConstructionClient appName='TestApp' />);

    expect(screen.getByTestId('helmet-icon')).toBeInTheDocument();
  });

  it('renders construction message', () => {
    render(<UnderConstructionClient appName='TestApp' />);

    expect(
      screen.getByText(/We're working hard to bring you something awesome/)
    ).toBeInTheDocument();
  });

  it('renders VersionDisplay component', () => {
    render(<UnderConstructionClient appName='TestApp' />);

    expect(screen.getByTestId('version-display')).toBeInTheDocument();
  });

  it('sets document title on mount', () => {
    const originalTitle = document.title;

    render(<UnderConstructionClient appName='TestApp' />);

    expect(document.title).toBe('Under Construction - TestApp');

    // Restore original title.
    document.title = originalTitle;
  });
});
