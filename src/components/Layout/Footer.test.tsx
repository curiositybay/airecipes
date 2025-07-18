import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// Mock the app config
jest.mock('@/config/app', () => ({
  appConfig: {
    description: 'Test app description',
    author: 'Test Author',
  },
}));

describe('Footer', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the footer element', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('footer');

    const container = footer.querySelector('.footer-container');
    expect(container).toBeInTheDocument();

    const content = container?.querySelector('.footer-content');
    expect(content).toBeInTheDocument();

    const tagline = content?.querySelector('.footer-tagline');
    expect(tagline).toBeInTheDocument();

    const copyright = content?.querySelector('.footer-copyright');
    expect(copyright).toBeInTheDocument();
  });
});
