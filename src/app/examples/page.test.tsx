import { render, screen } from '@testing-library/react';
import { mocks } from '@/test-utils/mocks';

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

describe('Examples Page', () => {
  beforeEach(() => {
    mocks.setup.all();
  });

  afterEach(() => {
    mocks.setup.clear();
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
    const Examples = jest.requireActual('./page').default;
    render(<Examples />);
    // Test that it displays some app name (not hardcoded)
    expect(screen.getByText(/is under construction/)).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/.* is under construction/);
  });

  it('passes the custom app name to UnderConstructionClient when set', () => {
    const customAppName = 'My Custom App';
    mocks.mock.config.updateMockConfig({ name: customAppName });

    jest.resetModules();
    const Examples = jest.requireActual('./page').default;
    render(<Examples />);
    expect(screen.getByTestId('under-construction')).toBeInTheDocument();
    expect(
      screen.getByText(`${customAppName} is under construction`)
    ).toBeInTheDocument();
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
