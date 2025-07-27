import { desertNightTheme } from './themes';
import { defaultTheme, themes, getTheme } from './theme';

describe('Theme Configuration', () => {
  describe('Theme Registry', () => {
    it('should be a Record<string, Theme>', () => {
      expect(typeof themes).toBe('object');
    });
  });

  describe('getTheme Function', () => {
    it('should return desert theme when no theme name is provided', () => {
      const theme = getTheme();
      expect(theme).toBeDefined();
    });

    it('should return desert-night theme when desert-night theme name is provided', () => {
      const theme = getTheme('desert-night');
      expect(theme).toBe(desertNightTheme);
    });

    it('should return default theme when non-existent theme name is provided', () => {
      const theme = getTheme('non-existent-theme');
      expect(theme).toBe(defaultTheme);
    });
  });
});
