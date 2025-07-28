import {
  generateMetadata,
  generatePageMetadata,
  generateErrorMetadata,
} from './metadata';

// Mock the app config
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Test App',
    description: 'Test app description',
    keywords: 'test, app, keywords',
    author: 'Test Author',
    url: 'https://testapp.com',
    twitterHandle: '@testauthor',
  },
}));

describe('metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('generates basic metadata with default values', () => {
      const metadata = generateMetadata();

      expect(metadata.title).toBe('Test App');
    });

    it('generates metadata with absolute image URL', () => {
      const metadata = generateMetadata({
        image: 'https://example.com/image.jpg',
      });

      expect(
        (metadata.openGraph?.images as unknown as { url: string }[])?.[0]?.url
      ).toBe('https://example.com/image.jpg');
      expect((metadata.twitter?.images as unknown as string[])?.[0]).toBe(
        'https://example.com/image.jpg'
      );
    });
  });

  describe('generatePageMetadata', () => {
    it('generates page metadata with title and description', () => {
      const metadata = generatePageMetadata(
        'Test Page',
        'Test page description'
      );

      expect(metadata.title).toBe('Test Page - Test App');
      expect(metadata.description).toBe('Test page description');
    });
  });

  describe('generateErrorMetadata', () => {
    it('generates error metadata with code and title', () => {
      const metadata = generateErrorMetadata(
        404,
        'Not Found',
        'Page not found'
      );

      expect(metadata.title).toBe('Not Found (404) - Test App');
      expect(metadata.description).toBe('Page not found');
      expect((metadata.openGraph as unknown as { type: string })?.type).toBe(
        'website'
      );
    });
  });
});
