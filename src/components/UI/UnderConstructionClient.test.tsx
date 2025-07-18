import React from 'react';
import { render } from '@testing-library/react';
import UnderConstructionClient from './UnderConstructionClient';

describe('UnderConstructionClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs a test stub', () => {
    render(<UnderConstructionClient appName='Test stub' />);
    expect(true).toBe(true);
  });
});
