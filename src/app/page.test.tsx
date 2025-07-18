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

describe('Home page', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('renders the under construction page', () => {
    jest.resetModules();
    const Home = jest.requireActual('./page').default;
    render(<Home />);
    expect(screen.getByTestId('under-construction')).toBeInTheDocument();
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
