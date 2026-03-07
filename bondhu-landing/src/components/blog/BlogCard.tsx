// src/components/blog/BlogCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { BlogPostMeta } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Clock, ArrowRight, Calendar } from 'lucide-react';

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  // Estimated reading time (you can calculate from content if available)
  const estimatedReadingTime = 5;

  if (featured) {
    return (
      <Link href={`/blogs/${post.slug}`} className="group block">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="flex items-center justify-center bg-secondary/20 p-4 md:p-6">
              <div className="relative w-full h-56 overflow-hidden rounded-lg">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-primary/90 backdrop-blur-sm border-primary/50 shadow-lg text-white font-semibold">
                    ⭐ Featured
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed text-sm md:text-base">
                {post.excerpt}
              </p>

              {/* Meta Info & CTA */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/50 gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>
                      {format(new Date(post.date), 'MMM dd, yyyy')}
                    </time>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {estimatedReadingTime} min
                  </span>
                </div>

                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  Read Article
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Regular card layout
  return (
    <Link href={`/blogs/${post.slug}`} className="group h-full block">
      <Card className="overflow-hidden h-full flex flex-col border-border/60 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300">
        {/* Image */}
        <div className="relative w-full h-56 overflow-hidden bg-secondary/20">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardHeader className="flex-1 space-y-4 pb-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-4">
          {/* Excerpt */}
          <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMM dd, yyyy')}
              </time>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{estimatedReadingTime} min read</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}