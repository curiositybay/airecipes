describe('Home page', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('exports metadata', () => {
    const { metadata } = jest.requireActual('./page');
    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(typeof metadata.title).toBe('string');
    expect(typeof metadata.description).toBe('string');
  });

  it('exports dynamic configuration', () => {
    const { dynamic } = jest.requireActual('./page');
    expect(dynamic).toBe('force-dynamic');
  });

  it('exports default function', () => {
    const { default: Home } = jest.requireActual('./page');
    expect(typeof Home).toBe('function');
  });
});
