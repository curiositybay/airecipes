// Mock the config before importing anything
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Mock App',
    description: 'Mock description',
    errorMessages: {
      notFound: 'Mock not found',
      serverError: 'Mock server error',
    },
  },
}));

import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and exports metadata', () => {
    const { getByText } = render(
      <RootLayout>
        <div data-testid='test-child'>Test Content</div>
      </RootLayout>
    );

    expect(getByText('Test Content')).toBeInTheDocument();

    // Test metadata exists (not specific values)
    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
  });
});
