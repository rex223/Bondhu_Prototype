// src/components/blog/TableOfContents.tsx
'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from the article
    const article = document.querySelector('article');
    if (!article) return;

    const headingElements = article.querySelectorAll('h2, h3');
    const items: TOCItem[] = Array.from(headingElements).map((heading) => {
      const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      if (!heading.id) heading.id = id;
      
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      };
    });

    setHeadings(items);

    // Setup Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => {
      headingElements.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Table of Contents</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`transition-all ${
              heading.level === 3 ? 'ml-4' : ''
            }`}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`text-left w-full py-1.5 px-3 rounded-lg transition-all hover:bg-primary/10 hover:text-primary ${
                activeId === heading.id
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'text-muted-foreground border-l-2 border-transparent'
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}