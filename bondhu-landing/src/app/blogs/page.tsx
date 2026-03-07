// src/app/blogs/page.tsx
import Script from 'next/script';
import { getAllBlogPosts } from '@/lib/blog';
import { BlogCard } from '@/components/blog/BlogCard';
import { SearchBar } from '@/components/blog/SearchBar';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { FilteredBlogContent } from '@/components/blog/FilteredBlogContent';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, TrendingUp, BookOpen, Brain, Zap } from 'lucide-react';

export const metadata = {
  title: 'Blog | Bondhu AI - Mental Health & Digital Twin Insights',
  description: 'Explore articles about Gen Z mental health, digital twins, agentic AI, and the future of personalized mental wellness.',
  openGraph: {
    title: 'Bondhu AI Blog - Mental Health & Digital Twin Insights',
    description: 'Expert insights on mental wellness, AI innovation, and digital twin technology for Gen Z',
  },
};

export default function BlogsPage() {
  const posts = getAllBlogPosts();
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.slice(1);

  // Extract unique tags for filtering
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-purple-500/10 dark:from-primary/5 dark:to-purple-500/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 border border-primary/20 dark:border-primary/30 backdrop-blur-sm animate-fade-in shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                Insights & Research
              </span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up">
                <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Bondhu AI
                </span>
                <span className="block mt-2 text-foreground">Knowledge Hub</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Exploring the intersection of digital twin and AI-powered mental wellness
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/60 dark:bg-background/80 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{posts.length} Articles</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/60 dark:bg-background/80 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Mental Health</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/60 dark:bg-background/80 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-pink-500/30 transition-all">
                <Zap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium">AI Innovation</span>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="max-w-2xl mx-auto pt-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <SearchBar />
              <CategoryFilter tags={allTags} />
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Content */}
      <FilteredBlogContent posts={posts} />

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-3xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border border-border/60 p-8 md:p-10 text-center backdrop-blur-sm shadow-lg">
          {/* Subtle Background Effect */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-30" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Stay Updated
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Get the latest insights on mental health, AI, and digital wellness delivered to your inbox
              </p>
            </div>

            {/* Mailchimp Form */}
            <form
              action="https://gmail.us1.list-manage.com/subscribe/post?u=e8cf2b2e3be95886b61940cfd&id=7551e5fab4&f_id=00ebc0e1f0"
              method="post"
              target="_blank"
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2 relative"
            >
              <input
                type="email"
                name="EMAIL"
                placeholder="Your email address"
                required
                className="flex-1 h-11 px-4 rounded-lg bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm placeholder:text-muted-foreground/50"
              />
              {/* Anti-bot hidden field */}
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <input type="text" name="b_e8cf2b2e3be95886b61940cfd_7551e5fab4" tabIndex={-1} value="" readOnly />
              </div>
              <input
                type="submit"
                value="Subscribe"
                className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md cursor-pointer"
              />
              {/* Response messages */}
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
              </div>
            </form>

            {/* Footer text */}
            <p className="text-xs text-muted-foreground/70 pt-1">
              Weekly insights • No spam • Unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* Mailchimp validation script */}
      <Script src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js" strategy="afterInteractive" />
    </main>
  );
}