import { render, screen } from '@testing-library/react';
import * as ButtonNamed from './Button';
import ButtonDefault from './Button';

describe('Debug Import Test', () => {
  it('should import Button components (named)', () => {
    expect(ButtonNamed.Button).toBeDefined();
    expect(ButtonNamed.PrimaryButton).toBeDefined();
    expect(ButtonNamed.SecondaryButton).toBeDefined();
    render(<ButtonNamed.Button>Test</ButtonNamed.Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  it('should import Button components (default)', () => {
    expect(ButtonDefault.Button).toBeDefined();
    expect(ButtonDefault.PrimaryButton).toBeDefined();
    expect(ButtonDefault.SecondaryButton).toBeDefined();
    render(<ButtonDefault.Button>Test</ButtonDefault.Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
