import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VersionDisplay from './VersionDisplay';

// Mock fetch
global.fetch = jest.fn();

describe('VersionDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display version when API call succeeds', async () => {
    const mockMetadata = {
      appVersion: '1.0.0',
      apiVersion: '1',
      lastDeployed: '2025-07-13T05:45:56.627Z',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetadata,
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
    });
  });

  it('should not display anything when API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should not display anything when API returns error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should not display anything when metadata is null', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should handle non-Error exceptions', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce('String error');

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });
});
