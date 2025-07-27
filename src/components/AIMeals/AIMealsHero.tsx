import AuthControls from '../UI/AuthControls';
import Image from 'next/image';

/**
 * Hero section component for the AI Meals page.
 */
export default function AIMealsHero() {
  return (
    <section className='ai-meals-hero bg-gradient-to-br from-slate-50 via-white to-slate-100 relative'>
      <div className='absolute top-4 right-4 z-50 flex justify-end'>
        <AuthControls />
      </div>

      <div className='ai-meals-hero-content'>
        <div className='ai-meals-icons'>
          <Image
            src='/airecipes.png'
            alt='AI Recipes Logo'
            width={128}
            height={128}
            className='w-24 h-24 md:w-32 md:h-32 object-contain'
          />
        </div>
        <h1 className='ai-meals-title'>AI Recipe Generator by Curiosity Bay</h1>
        <p className='ai-meals-subtitle'>
          Turn your ingredients into delicious meals with AI-powered recipe
          suggestions
        </p>
      </div>
    </section>
  );
}
