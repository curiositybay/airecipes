import { getFallbackRecipes } from './fallback-recipes';

describe('fallback-recipes', () => {
  describe('getFallbackRecipes', () => {
    it('returns fallback recipes with provided ingredients', () => {
      const ingredients = ['tomato', 'pasta'];
      const result = getFallbackRecipes(ingredients);

      expect(result).toHaveProperty('recipes');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.recipes)).toBe(true);
      expect(result.recipes).toHaveLength(3);
    });

    it('includes provided ingredients in all recipes', () => {
      const ingredients = ['chicken', 'broccoli'];
      const result = getFallbackRecipes(ingredients);

      result.recipes.forEach(recipe => {
        ingredients.forEach(ingredient => {
          expect(recipe.ingredients).toContain(ingredient);
        });
      });
    });

    it('returns three specific fallback recipes', () => {
      const ingredients = ['carrot'];
      const result = getFallbackRecipes(ingredients);

      const recipeNames = result.recipes.map(recipe => recipe.name);
      expect(recipeNames).toContain('Simple Stir Fry');
      expect(recipeNames).toContain('Quick Salad');
      expect(recipeNames).toContain('Simple Soup');
    });

    it('includes additional ingredients in recipes', () => {
      const ingredients = ['potato'];
      const result = getFallbackRecipes(ingredients);

      // Check that common ingredients are added
      const allIngredients = result.recipes.flatMap(
        recipe => recipe.ingredients
      );
      expect(allIngredients).toContain('soy sauce');
      expect(allIngredients).toContain('garlic');
      expect(allIngredients).toContain('oil');
      expect(allIngredients).toContain('olive oil');
      expect(allIngredients).toContain('lemon juice');
      expect(allIngredients).toContain('salt');
      expect(allIngredients).toContain('pepper');
      expect(allIngredients).toContain('vegetable broth');
      expect(allIngredients).toContain('onion');
      expect(allIngredients).toContain('herbs');
    });

    it('returns recipes with proper structure', () => {
      const ingredients = ['spinach'];
      const result = getFallbackRecipes(ingredients);

      result.recipes.forEach(recipe => {
        expect(recipe).toHaveProperty('name');
        expect(recipe).toHaveProperty('description');
        expect(recipe).toHaveProperty('tags');
        expect(recipe).toHaveProperty('ingredients');
        expect(recipe).toHaveProperty('instructions');
        expect(recipe).toHaveProperty('prepTime');
        expect(recipe).toHaveProperty('difficulty');
        expect(recipe).toHaveProperty('servings');
        expect(recipe).toHaveProperty('nutritionalInfo');
      });
    });

    it('returns suggestions with proper structure', () => {
      const ingredients = ['mushroom'];
      const result = getFallbackRecipes(ingredients);

      expect(result.suggestions).toHaveProperty('additionalIngredients');
      expect(result.suggestions).toHaveProperty('cookingTips');
      expect(result.suggestions).toHaveProperty('substitutions');

      expect(Array.isArray(result.suggestions.additionalIngredients)).toBe(
        true
      );
      expect(Array.isArray(result.suggestions.cookingTips)).toBe(true);
      expect(Array.isArray(result.suggestions.substitutions)).toBe(true);
    });

    it('includes specific additional ingredients in suggestions', () => {
      const ingredients = ['bell pepper'];
      const result = getFallbackRecipes(ingredients);

      const expectedIngredients = [
        'garlic',
        'onion',
        'olive oil',
        'salt',
        'pepper',
      ];
      expectedIngredients.forEach(ingredient => {
        expect(result.suggestions.additionalIngredients).toContain(ingredient);
      });
    });

    it('includes cooking tips in suggestions', () => {
      const ingredients = ['zucchini'];
      const result = getFallbackRecipes(ingredients);

      const expectedTips = [
        'Always taste as you cook and adjust seasoning',
        'Prep all ingredients before starting to cook',
        'Keep your cooking area clean and organized',
      ];

      expectedTips.forEach(tip => {
        expect(result.suggestions.cookingTips).toContain(tip);
      });
    });

    it('includes substitutions in suggestions', () => {
      const ingredients = ['eggplant'];
      const result = getFallbackRecipes(ingredients);

      const expectedSubstitutions = [
        'Use any cooking oil if olive oil is not available',
        'Substitute any broth for vegetable broth',
        'Use any fresh herbs you have available',
      ];

      expectedSubstitutions.forEach(substitution => {
        expect(result.suggestions.substitutions).toContain(substitution);
      });
    });

    it('returns recipes with correct nutritional information', () => {
      const ingredients = ['cauliflower'];
      const result = getFallbackRecipes(ingredients);

      result.recipes.forEach(recipe => {
        expect(recipe.nutritionalInfo).toHaveProperty('calories');
        expect(recipe.nutritionalInfo).toHaveProperty('protein');
        expect(recipe.nutritionalInfo).toHaveProperty('carbs');
        expect(recipe.nutritionalInfo).toHaveProperty('fat');

        expect(typeof recipe.nutritionalInfo.calories).toBe('number');
        expect(typeof recipe.nutritionalInfo.protein).toBe('string');
        expect(typeof recipe.nutritionalInfo.carbs).toBe('string');
        expect(typeof recipe.nutritionalInfo.fat).toBe('string');
      });
    });

    it('returns recipes with correct difficulty levels', () => {
      const ingredients = ['sweet potato'];
      const result = getFallbackRecipes(ingredients);

      result.recipes.forEach(recipe => {
        expect(recipe.difficulty).toBe('Easy');
      });
    });

    it('returns recipes with reasonable prep times', () => {
      const ingredients = ['asparagus'];
      const result = getFallbackRecipes(ingredients);

      const prepTimes = result.recipes.map(recipe => recipe.prepTime);
      expect(prepTimes).toContain('15 minutes');
      expect(prepTimes).toContain('10 minutes');
      expect(prepTimes).toContain('25 minutes');
    });

    it('returns recipes with reasonable serving sizes', () => {
      const ingredients = ['green beans'];
      const result = getFallbackRecipes(ingredients);

      const servings = result.recipes.map(recipe => recipe.servings);
      expect(servings).toContain(2);
      expect(servings).toContain(4);
    });

    it('works with empty ingredients array', () => {
      const ingredients: string[] = [];
      const result = getFallbackRecipes(ingredients);

      expect(result.recipes).toHaveLength(3);
      expect(result.suggestions).toBeDefined();
    });

    it('works with single ingredient', () => {
      const ingredients = ['tomato'];
      const result = getFallbackRecipes(ingredients);

      expect(result.recipes).toHaveLength(3);
      result.recipes.forEach(recipe => {
        expect(recipe.ingredients).toContain('tomato');
      });
    });

    it('works with multiple ingredients', () => {
      const ingredients = ['tomato', 'onion', 'garlic', 'basil'];
      const result = getFallbackRecipes(ingredients);

      expect(result.recipes).toHaveLength(3);
      ingredients.forEach(ingredient => {
        result.recipes.forEach(recipe => {
          expect(recipe.ingredients).toContain(ingredient);
        });
      });
    });
  });
});
