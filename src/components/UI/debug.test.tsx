import { render, screen } from '@testing-library/react';
import * as ButtonNamed from './Button';
import { Button as ButtonDefault } from './Button';

describe('Debug Import Test', () => {
  it('should import Button components (named)', () => {
    expect(ButtonNamed.Button).toBeDefined();
    expect(ButtonNamed.PrimaryButton).toBeDefined();
    expect(ButtonNamed.SecondaryButton).toBeDefined();
    render(<ButtonNamed.Button>Test</ButtonNamed.Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  it('should import Button components (default)', () => {
    expect(ButtonDefault).toBeDefined();
    expect(ButtonNamed.PrimaryButton).toBeDefined();
    expect(ButtonNamed.SecondaryButton).toBeDefined();
    render(<ButtonDefault>Test</ButtonDefault>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
