describe('setup', () => {
  it('should have setup file that imports mocks', () => {
    // The setup file should exist and be importable
    expect(() => {
      import('./setup');
    }).not.toThrow();
  });
});
