import React from 'react';
import { render, screen } from '@testing-library/react';
import AIMealsLayout from './AIMealsLayout';

describe('AIMealsLayout', () => {
  it('should render children correctly', () => {
    render(
      <AIMealsLayout>
        <div data-testid='test-child'>Test Content</div>
      </AIMealsLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    render(
      <AIMealsLayout>
        <div>Test Content</div>
      </AIMealsLayout>
    );

    const mainSection = document.querySelector('.ai-meals-main');
    const container = document.querySelector('.ai-meals-container');

    expect(mainSection).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <AIMealsLayout>
        <div data-testid='child-1'>Child 1</div>
        <div data-testid='child-2'>Child 2</div>
        <div data-testid='child-3'>Child 3</div>
      </AIMealsLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});
