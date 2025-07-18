import { render } from '@testing-library/react';
import StructuredData from './StructuredData';

// Mock the app config
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Test App',
    description: 'Test Description',
    url: 'https://test.com',
    githubRepo: 'https://github.com/test/repo',
    contactEmail: 'test@example.com',
    author: 'Test Author',
  },
}));

describe('StructuredData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default WebApplication type', () => {
    render(<StructuredData />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptElement).toBeInTheDocument();
    expect(scriptElement).toHaveAttribute('type', 'application/ld+json');
  });

  it('renders with Organization type', () => {
    render(<StructuredData type='Organization' />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptElement).toBeInTheDocument();

    const scriptContent = scriptElement?.innerHTML;
    const parsedData = JSON.parse(scriptContent || '{}');
    expect(parsedData['@type']).toBe('Organization');
  });

  it('renders with Person type', () => {
    render(<StructuredData type='Person' />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptElement).toBeInTheDocument();

    const scriptContent = scriptElement?.innerHTML;
    const parsedData = JSON.parse(scriptContent || '{}');
    expect(parsedData['@type']).toBe('Person');
  });

  it('renders default structured data with correct properties', () => {
    render(<StructuredData />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    const scriptContent = scriptElement?.innerHTML;
    const parsedData = JSON.parse(scriptContent || '{}');

    expect(parsedData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Test App',
      description: 'Test Description',
      url: 'https://test.com',
      logo: 'https://test.com/logo.svg',
      sameAs: ['https://github.com/test/repo'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'test@example.com',
      },
      author: {
        '@type': 'Person',
        name: 'Test Author',
      },
    });
  });

  it('renders custom data when provided', () => {
    const customData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Custom Product',
      description: 'Custom Description',
    };

    render(<StructuredData customData={customData} />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    const scriptContent = scriptElement?.innerHTML;
    const parsedData = JSON.parse(scriptContent || '{}');

    expect(parsedData).toEqual(customData);
    expect(parsedData['@type']).toBe('Product');
    expect(parsedData.name).toBe('Custom Product');
  });

  it('renders custom data with different type prop', () => {
    const customData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Custom Article',
    };

    render(<StructuredData type='Organization' customData={customData} />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    const scriptContent = scriptElement?.innerHTML;
    const parsedData = JSON.parse(scriptContent || '{}');

    // Custom data should override the type prop
    expect(parsedData).toEqual(customData);
    expect(parsedData['@type']).toBe('Article');
  });

  it('renders with dangerouslySetInnerHTML', () => {
    const { container } = render(<StructuredData />);

    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptElement).toBeInTheDocument();
    expect(scriptElement?.innerHTML).toBeTruthy();
  });

  it('renders valid JSON structure', () => {
    render(<StructuredData />);

    const scriptElement = document.querySelector(
      'script[type="application/ld+json"]'
    );
    const scriptContent = scriptElement?.innerHTML;

    // Should be valid JSON
    expect(() => JSON.parse(scriptContent || '{}')).not.toThrow();
  });
});
