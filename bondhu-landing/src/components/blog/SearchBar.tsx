// src/components/blog/SearchBar.tsx
'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';

function SearchBarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with URL params when they change externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounce the search with ref to maintain focus
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        setIsUpdating(true);
        const params = new URLSearchParams(searchParams.toString());
        
        if (inputValue.trim()) {
          params.set('search', inputValue.trim());
        } else {
          params.delete('search');
        }
        
        // Use replace instead of push to avoid adding to history
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        
        // Small delay to let router update
        setTimeout(() => setIsUpdating(false), 100);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, router, pathname, searchParams]);

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search articles by title, topic, or keyword..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-12 pr-12 h-14 bg-background/80 backdrop-blur-sm border-border/60 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all text-base rounded-xl shadow-sm hover:shadow-md"
      />
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-secondary rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      {isUpdating && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search articles by title, topic, or keyword..."
          disabled
          className="pl-12 pr-12 h-14 bg-background/80 backdrop-blur-sm border-border/60 text-base rounded-xl shadow-sm"
        />
      </div>
    }>
      <SearchBarInner />
    </Suspense>
  );
}