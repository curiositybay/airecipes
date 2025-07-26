import { ReactNode } from 'react';

interface AIMealsLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for the AI Meals page main content.
 */
export default function AIMealsLayout({ children }: AIMealsLayoutProps) {
  return (
    <section className='ai-meals-main'>
      <div className='ai-meals-container'>{children}</div>
    </section>
  );
}
