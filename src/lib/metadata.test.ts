import {
  generateMetadata,
  generatePageMetadata,
  generateErrorMetadata,
  type MetadataOptions,
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
      expect(metadata.description).toBe('Test app description');
      expect(metadata.keywords).toBe('test, app, keywords');
      expect(metadata.authors).toEqual([{ name: 'Test Author' }]);
      expect(metadata.creator).toBe('Test Author');
      expect(metadata.publisher).toBe('Test Author');
    });

    it('generates metadata with custom title', () => {
      const metadata = generateMetadata({ title: 'Custom Page' });

      expect(metadata.title).toBe('Custom Page - Test App');
      expect(metadata.description).toBe('Test app description');
    });

    it('generates metadata with custom description', () => {
      const metadata = generateMetadata({
        description: 'Custom description',
      });

      expect(metadata.title).toBe('Test App');
      expect(metadata.description).toBe('Custom description');
    });

    it('generates metadata with custom keywords', () => {
      const metadata = generateMetadata({ keywords: 'custom, keywords' });

      expect(metadata.keywords).toBe('custom, keywords');
    });

    it('generates metadata with custom image URL', () => {
      const metadata = generateMetadata({ image: '/custom-image.jpg' });

      expect(
        (metadata.openGraph?.images as unknown as { url: string }[])?.[0]?.url
      ).toBe('https://testapp.com/custom-image.jpg');
      expect((metadata.twitter?.images as unknown as string[])?.[0]).toBe(
        'https://testapp.com/custom-image.jpg'
      );
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

    it('generates metadata with custom URL', () => {
      const metadata = generateMetadata({ url: '/custom-page' });

      expect(metadata.openGraph?.url).toBe('/custom-page');
      expect(metadata.alternates?.canonical).toBe('/custom-page');
    });

    it('generates metadata with custom type', () => {
      const metadata = generateMetadata({ type: 'article' });

      expect((metadata.openGraph as unknown as { type: string })?.type).toBe(
        'article'
      );
    });

    it('generates metadata with all custom options', () => {
      const options: MetadataOptions = {
        title: 'Custom Title',
        description: 'Custom description',
        keywords: 'custom, keywords',
        image: '/custom-image.jpg',
        url: '/custom-page',
        type: 'article',
      };

      const metadata = generateMetadata(options);

      expect(metadata.title).toBe('Custom Title - Test App');
      expect(metadata.description).toBe('Custom description');
      expect(metadata.keywords).toBe('custom, keywords');
      expect((metadata.openGraph as unknown as { type: string })?.type).toBe(
        'article'
      );
      expect(metadata.openGraph?.url).toBe('/custom-page');
      expect(
        (metadata.openGraph?.images as unknown as { url: string }[])?.[0]?.url
      ).toBe('https://testapp.com/custom-image.jpg');
    });

    it('includes robots configuration', () => {
      const metadata = generateMetadata();

      expect(metadata.robots).toEqual({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });

    it('includes OpenGraph configuration', () => {
      const metadata = generateMetadata();

      expect(metadata.openGraph).toEqual({
        type: 'website',
        url: 'https://testapp.com',
        title: 'Test App',
        description: 'Test app description',
        siteName: 'Test App',
        locale: 'en_US',
        images: [
          {
            url: 'https://testapp.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Test App',
          },
        ],
      });
    });

    it('includes Twitter configuration', () => {
      const metadata = generateMetadata();

      expect(metadata.twitter).toEqual({
        card: 'summary_large_image',
        title: 'Test App',
        description: 'Test app description',
        images: ['https://testapp.com/og-image.jpg'],
        creator: '@testauthor',
      });
    });

    it('includes other meta tags', () => {
      const metadata = generateMetadata();

      expect(metadata.other).toEqual({
        'theme-color': '#0f766e',
        'msapplication-TileColor': '#0f766e',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': 'Test App',
      });
    });

    it('includes verification codes', () => {
      const metadata = generateMetadata();

      expect(metadata.verification).toEqual({
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-verification-code',
      });
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

    it('generates page metadata with additional options', () => {
      const metadata = generatePageMetadata(
        'Test Page',
        'Test page description',
        { type: 'article', image: '/article-image.jpg' }
      );

      expect(metadata.title).toBe('Test Page - Test App');
      expect(metadata.description).toBe('Test page description');
      expect((metadata.openGraph as unknown as { type: string })?.type).toBe(
        'article'
      );
      expect(
        (metadata.openGraph?.images as unknown as { url: string }[])?.[0]?.url
      ).toBe('https://testapp.com/article-image.jpg');
    });

    it('generates page metadata without description', () => {
      const metadata = generatePageMetadata('Test Page');

      expect(metadata.title).toBe('Test Page - Test App');
      expect(metadata.description).toBe('Test app description');
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

    it('generates error metadata for different error codes', () => {
      const metadata = generateErrorMetadata(
        500,
        'Server Error',
        'Internal server error'
      );

      expect(metadata.title).toBe('Server Error (500) - Test App');
      expect(metadata.description).toBe('Internal server error');
    });
  });
});
