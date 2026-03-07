// src/app/blogs/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { getBlogPost, getAllBlogSlugs, getRelatedPosts, calculateReadingTime } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, User, ArrowRight, Twitter, Linkedin, Facebook, Copy, Eye, TrendingUp } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ReadingProgress } from '@/components/blog/ReadingProgress';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Bondhu AI',
    };
  }

  return {
    title: `${post.title} | Bondhu AI Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 dark:bg-background/98 backdrop-blur-lg border-b border-border/40 animate-fade-in shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">All Articles</span>
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              {/* Reading Stats - Hidden on Mobile */}
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground mr-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="hidden lg:inline">Reading</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                  title="Share article"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                {/* Share Dropdown */}
                <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <ShareButtons title={post.title} url={`/blogs/${post.slug}`} />
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Reading Progress Indicator */}
        <ReadingProgress />
      </nav>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Content */}
            <div className="max-w-4xl">
              {/* Article Header */}
              <header className="mb-12 md:mb-16 space-y-8 animate-fade-in-up">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-sm px-3 py-1.5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 transition-colors cursor-pointer shadow-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
                  {post.title}
                </h1>

                {/* Excerpt */}
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Metadata Bar */}
                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 flex items-center justify-center ring-2 ring-primary/10 dark:ring-primary/20">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">Bondhu AI Team</p>
                      <p className="text-muted-foreground">Research & Insights</p>
                    </div>
                  </div>
                  
                  <div className="h-8 w-px bg-border/50 hidden sm:block" />
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.date}>
                        {format(new Date(post.date), 'MMMM dd, yyyy')}
                      </time>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Cover Image */}
              <div className="relative w-full max-w-3xl aspect-[21/9] rounded-2xl overflow-hidden mb-16 shadow-2xl dark:shadow-primary/5 animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent dark:from-black/50" />
              </div>

              {/* Article Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none animate-fade-in-up
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-headings:text-foreground
                  prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/50
                  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-all
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-8 prose-ul:space-y-3 prose-li:my-2 prose-li:text-muted-foreground prose-li:leading-relaxed
                  prose-ol:my-8 prose-ol:space-y-3
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-secondary/30 dark:prose-blockquote:bg-secondary/50 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:rounded-r-lg
                  prose-code:text-primary prose-code:bg-secondary/70 dark:prose-code:bg-secondary/80 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-secondary/70 dark:prose-pre:bg-secondary/80 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:my-8 prose-pre:shadow-lg
                  prose-img:rounded-xl prose-img:shadow-lg dark:prose-img:shadow-primary/5 prose-img:my-10"
                style={{ animationDelay: '0.3s' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Article Footer Tags */}
              <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold text-foreground">Topics:</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 dark:hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="relative overflow-hidden p-10 md:p-14 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-primary/20 dark:border-primary/30 backdrop-blur-sm shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl opacity-50" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl opacity-50" />
                  
                  <div className="relative space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 dark:bg-primary/30 border border-primary/30 dark:border-primary/40 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Transform Your Mental Wellness</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                      Experience Bondhu AI Today
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                      Join thousands discovering personalized mental health support powered by digital twin technology and empathetic AI.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link href="/">
                        <Button size="lg" className="font-semibold group h-12 px-8 shadow-lg hover:shadow-xl transition-all">
                          Get Started Free
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Share */}
              <div className="mt-16 pt-10 border-t border-border/50 animate-fade-in">
                <p className="text-sm font-semibold mb-5 text-foreground">Share this article</p>
                <ShareButtons title={post.title} url={`/blogs/${post.slug}`} />
              </div>
            </div>

            {/* Sidebar - Table of Contents (Desktop Only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <TableOfContents />

                {/* Author Info Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 border border-primary/20 dark:border-primary/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 flex items-center justify-center ring-2 ring-primary/10 dark:ring-primary/20">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Bondhu AI Team</p>
                      <p className="text-xs text-muted-foreground">Research & Insights</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dedicated to advancing mental health through innovative AI technology and compassionate care.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-7xl mx-auto mt-24 pt-20 border-t border-border/50 animate-fade-in">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 border border-primary/30 dark:border-primary/40">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Continue Reading</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Explore more insights on mental health, AI, and digital wellness
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <div 
                  key={relatedPost.slug} 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BlogCard post={relatedPost} />
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}