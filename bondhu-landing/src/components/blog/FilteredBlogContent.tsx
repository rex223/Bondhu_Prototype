// src/components/blog/FilteredBlogContent.tsx
'use client';

import { BlogCard } from '@/components/blog/BlogCard';
import { TrendingUp, BookOpen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, Suspense } from 'react';
import type { BlogPostMeta } from '@/lib/blog';

interface FilteredBlogContentProps {
  posts: BlogPostMeta[];
}

function FilteredBlogContentInner({ posts }: FilteredBlogContentProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedTag = searchParams.get('tag') || null;

  // Filter posts based on URL params
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.slice(1);

  return (
    <>
      {/* Results Summary */}
      {(searchQuery || selectedTag) && (
        <section className="container mx-auto px-4 pt-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-secondary/50 to-secondary/30 border border-border/60 backdrop-blur-sm shadow-sm">
              <p className="text-sm text-muted-foreground">
                {filteredPosts.length === 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full" />
                    No articles found
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Found <span className="font-semibold text-foreground">{filteredPosts.length}</span> article{filteredPosts.length !== 1 ? 's' : ''}
                    {selectedTag && <span> in <span className="font-semibold text-primary">&quot;{selectedTag}&quot;</span></span>}
                    {searchQuery && <span> matching <span className="font-semibold text-foreground">&quot;{searchQuery}&quot;</span></span>}
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {featuredPost && (
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20 shadow-sm">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {searchQuery || selectedTag ? 'Top Result' : 'Featured Article'}
            </h2>
          </div>
          
          <div className="max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <BlogCard post={featuredPost} featured />
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="container mx-auto px-4 pb-24">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-lg">
                <BookOpen className="w-12 h-12 text-primary/70" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500/30 rounded-full animate-ping" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              {searchQuery || selectedTag ? 'No Results Found' : 'Coming Soon'}
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed mb-6">
              {searchQuery || selectedTag 
                ? "Try adjusting your search or filter to find what you&apos;re looking for."
                : "We&apos;re crafting valuable content for you. Our first articles on mental health and digital twins are on the way!"
              }
            </p>
            {(searchQuery || selectedTag) && (
              <Link 
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <div className="w-4 h-4" />
                Clear all filters
              </Link>
            )}
          </div>
        ) : regularPosts.length > 0 ? (
          <>
            <div className="mb-12 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {searchQuery || selectedTag ? 'More Results' : 'Latest Articles'}
                </h2>
                <span className="text-sm text-muted-foreground font-medium">
                  {regularPosts.length} article{regularPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-muted-foreground text-lg">
                Discover insightful content on mental wellness and AI innovation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {regularPosts.map((post, index) => (
                <div 
                  key={post.slug} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

export function FilteredBlogContent({ posts }: FilteredBlogContentProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <FilteredBlogContentInner posts={posts} />
    </Suspense>
  );
}