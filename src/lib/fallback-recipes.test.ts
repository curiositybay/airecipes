import { getFallbackRecipes } from './fallback-recipes';

describe('fallback-recipes', () => {
  describe('getFallbackRecipes', () => {
    it('returns fallback recipes with provided ingredients', () => {
      const ingredients = ['tomato', 'pasta'];
      const result = getFallbackRecipes(ingredients);
      expect(result.recipes).toHaveLength(3);
    });
  });
});
