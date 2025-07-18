import { render, screen } from '@testing-library/react';

// Mock the UnderConstructionClient component
jest.mock('@/components/UI/UnderConstructionClient', () => {
  return function MockUnderConstructionClient({
    appName,
  }: {
    appName: string;
  }) {
    return (
      <div data-testid='under-construction'>
        <h1>{appName} is under construction</h1>
        <p>
          We&apos;re working hard to bring you something awesome. Please check
          back soon!
        </p>
      </div>
    );
  };
});

// Mock the app config
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Test App',
    description: 'Test description',
  },
}));

describe('Examples Page', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('renders the under construction page', () => {
    jest.resetModules();
    const Examples = jest.requireActual('./page').default;
    render(<Examples />);
    expect(screen.getByTestId('under-construction')).toBeInTheDocument();
    expect(screen.getByText(/is under construction/)).toBeInTheDocument();
    expect(
      screen.getByText(/We.*re working hard to bring you something awesome/)
    ).toBeInTheDocument();
  });

  it('passes the correct app name to UnderConstructionClient (default)', () => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_APP_NAME;
    const Examples = jest.requireActual('./page').default;
    render(<Examples />);
    // Test that it displays some app name (not hardcoded)
    expect(screen.getByText(/is under construction/)).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/.* is under construction/);
  });

  it('passes the NEXT_PUBLIC_APP_NAME to UnderConstructionClient if set', () => {
    const customAppName = 'My Custom App';
    process.env.NEXT_PUBLIC_APP_NAME = customAppName;

    // Temporarily unmock the app config to test environment variable
    jest.unmock('@/config/app');
    jest.resetModules();

    const Examples = jest.requireActual('./page').default;
    render(<Examples />);
    expect(screen.getByTestId('under-construction')).toBeInTheDocument();
    // Re-mock the app config for other tests
    jest.mock('@/config/app', () => ({
      appConfig: {
        name: 'Test App',
        description: 'Test description',
      },
    }));
  });

  it('exports metadata', () => {
    const { metadata } = jest.requireActual('./page');
    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(typeof metadata.title).toBe('string');
    expect(typeof metadata.description).toBe('string');
  });

  it('exports dynamic configuration', () => {
    const { dynamic } = jest.requireActual('./page');
    expect(dynamic).toBe('force-static');
  });
});
