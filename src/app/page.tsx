import { Metadata } from 'next';
import AIMealsPage from '@/components/AIMeals/AIMealsPage';
import { appConfig } from '@/config/app';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `AI Recipe Generator - ${appConfig.name}`,
  description:
    'Generate delicious recipes from your available ingredients using AI. Get personalized meal suggestions and cooking instructions.',
  keywords:
    'AI recipes, meal planning, cooking, ingredients, food, recipe generator',
};

export default function Home() {
  return <AIMealsPage />;
}
