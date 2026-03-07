import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const blogsDirectory = path.join(process.cwd(), 'src/content/blogs');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
}

// Get all blog posts metadata (for listing page)
export function getAllBlogPosts(): BlogPostMeta[] {
  const fileNames = fs.readdirSync(blogsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        coverImage: data.coverImage || '/images/blogs/default.jpg',
      };
    });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Get single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Convert markdown to HTML
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt,
      coverImage: data.coverImage || '/images/blogs/default.jpg',
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error reading blog post: ${slug}`, error);
    return null;
  }
}

// Get all slugs for static generation
export function getAllBlogSlugs(): string[] {
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}

// Get related posts by tags
export function getRelatedPosts(currentSlug: string, tags: string[], limit = 3): BlogPostMeta[] {
  const allPosts = getAllBlogPosts();
  
  return allPosts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => post.tags.some((tag) => tags.includes(tag)))
    .slice(0, limit);
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}