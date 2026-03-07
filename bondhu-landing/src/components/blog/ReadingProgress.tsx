// src/components/blog/ReadingProgress.tsx
'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progressValue = (scrolled / documentHeight) * 100;
      
      setProgress(Math.min(progressValue, 100));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-1 bg-border/30">
      <div
        className="h-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 transition-all duration-150 ease-out origin-left"
        style={{ 
          transform: `scaleX(${progress / 100})`,
          willChange: 'transform'
        }}
      />
    </div>
  );
}