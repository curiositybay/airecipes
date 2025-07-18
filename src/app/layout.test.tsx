import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

// Mock the dependencies
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter-font',
  })),
}));

jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Test App',
    description: 'Test description',
  },
}));

jest.mock('@/components/StructuredData', () => {
  return function MockStructuredData() {
    return <div data-testid='structured-data'>Structured Data</div>;
  };
});

// Mock CSS imports
jest.mock('./globals.css', () => ({}));
jest.mock('@fortawesome/fontawesome-free/css/all.min.css', () => ({}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children content', () => {
    const { getByText } = render(
      <RootLayout>
        <div data-testid='test-child'>Test Content</div>
      </RootLayout>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with different children content', () => {
    const { getByText } = render(
      <RootLayout>
        <h1>Hello World</h1>
        <p>This is a paragraph</p>
      </RootLayout>
    );

    expect(getByText('Hello World')).toBeInTheDocument();
    expect(getByText('This is a paragraph')).toBeInTheDocument();
  });

  it('exports metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata).toEqual({
      title: 'Test App',
      description: 'Test description',
    });
  });

  it('handles null children', () => {
    const { container } = render(<RootLayout>{null}</RootLayout>);
    expect(container).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    const { container } = render(<RootLayout>{undefined}</RootLayout>);
    expect(container).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <RootLayout>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </RootLayout>
    );

    expect(getByText('Header')).toBeInTheDocument();
    expect(getByText('Main Content')).toBeInTheDocument();
    expect(getByText('Footer')).toBeInTheDocument();
  });
});
