// src/components/blog/CategoryFilter.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';

interface CategoryFilterProps {
  tags: string[];
}

function CategoryFilterInner({ tags }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const selectedTag = searchParams.get('tag') || null;

  const handleTagClick = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    // Use replace instead of push
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <Filter className="w-4 h-4" />
        <span>Filter:</span>
      </div>
     
      <Badge
        variant={selectedTag === null ? 'default' : 'outline'}
        className="cursor-pointer px-3 py-1.5 hover:scale-105 transition-all shadow-sm"
        onClick={() => handleTagClick(null)}
      >
        All Topics
        {selectedTag && <X className="w-3 h-3 ml-1" />}
      </Badge>
     
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? 'default' : 'outline'}
          className={`cursor-pointer px-3 py-1.5 transition-all shadow-sm ${
            selectedTag === tag 
              ? 'ring-2 ring-primary/20 scale-105' 
              : 'hover:scale-105 hover:border-primary/50'
          }`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function CategoryFilter({ tags }: CategoryFilterProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <Badge variant="outline" className="px-3 py-1.5 animate-pulse">
          Loading...
        </Badge>
      </div>
    }>
      <CategoryFilterInner tags={tags} />
    </Suspense>
  );
}