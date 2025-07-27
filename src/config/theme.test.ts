import { defaultTheme, themes, getTheme } from './theme';

describe('Theme Configuration', () => {
  describe('Theme Registry', () => {
    it('should have themes object', () => {
      expect(themes).toBeDefined();
    });
  });

  describe('getTheme Function', () => {
    it('should return desert theme when no theme name is provided', () => {
      const theme = getTheme();
      expect(theme).toBeDefined();
    });

    it('should return a theme when valid theme name is provided', () => {
      const theme = getTheme('desert-night');
      expect(theme).toBeDefined();
    });

    it('should return default theme when non-existent theme name is provided', () => {
      const theme = getTheme('non-existent-theme');
      expect(theme).toBe(defaultTheme);
    });
  });
});
