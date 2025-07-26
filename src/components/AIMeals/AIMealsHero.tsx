import AuthControls from '../UI/AuthControls';

/**
 * Hero section component for the AI Meals page.
 */
export default function AIMealsHero() {
  return (
    <section className='ai-meals-hero bg-gradient-to-br from-slate-50 via-white to-slate-100 relative'>
      {/* Auth Controls - Top Right */}
      <div className='absolute top-4 right-4 z-50'>
        <AuthControls />
      </div>

      <div className='ai-meals-hero-content'>
        <div className='ai-meals-icons'>
          <i className='fas fa-robot text-6xl md:text-8xl mr-8 theme-text-icon-primary'></i>
          <i className='fas fa-utensils text-6xl md:text-8xl theme-text-icon-primary'></i>
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
