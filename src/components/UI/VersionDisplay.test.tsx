import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { mocks } from '@/test-utils/mocks';
import VersionDisplay from './VersionDisplay';

describe('VersionDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.setup.all();
  });

  afterEach(() => {
    mocks.setup.clear();
  });

  it('should display version when API call succeeds', async () => {
    const mockMetadata = {
      appVersion: '1.0.0',
      apiVersion: '1',
      lastDeployed: '2025-07-13T05:45:56.627Z',
    };

    mocks.mock.http.fetchSuccess({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockMetadata),
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
    });
  });

  it('should not display anything when API call fails', async () => {
    mocks.mock.http.fetchFailure();

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should not display anything when API returns error', async () => {
    mocks.mock.http.fetchSuccess({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should not display anything when metadata is null', async () => {
    mocks.mock.http.fetchSuccess({
      ok: true,
      status: 200,
      json: () => Promise.resolve(null),
    });

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should handle non-Error exceptions', async () => {
    mocks.mock.http.fetchFailure(new Error('String error'));

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  it('should handle string errors', async () => {
    mocks.mock.http.fetchFailure('String error' as unknown as Error);

    render(<VersionDisplay />);

    await waitFor(() => {
      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });
  });
});
