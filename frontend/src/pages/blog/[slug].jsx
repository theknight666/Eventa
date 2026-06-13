import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BLOG_POSTS } from "@/data/blog";
import SEO from "@/components/SEO";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPost({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className="min-h-screen pt-32 pb-20 text-center"><h1 className="text-3xl font-bold">Loading...</h1></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <Link href="/blog" className="text-primary hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  // Simple Markdown-like renderer for our static content
  const renderContent = (content) => {
    return content.split('\\n').map((line, idx) => {
      const txt = line.trim();
      if (!txt) return <br key={idx} />;
      
      if (txt.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl md:text-4xl font-black mt-8 mb-4">{txt.substring(2)}</h1>;
      }
      if (txt.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold mt-8 mb-3">{txt.substring(3)}</h2>;
      }
      if (txt.startsWith('- ')) {
        // Simple bold parser for list items
        const inner = txt.substring(2).split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
        return <li key={idx} className="ml-6 mb-2 list-disc text-muted-foreground leading-relaxed">{inner}</li>;
      }
      
      // Paragraph with bold parsing
      const inner = txt.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
      
      // Link parsing [Text](/link)
      const linkMatch = txt.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const parts = txt.split(linkMatch[0]);
        return (
          <p key={idx} className="text-muted-foreground leading-relaxed mb-4 text-lg">
            {parts[0]}
            <Link href={linkMatch[2]} className="text-primary font-medium hover:underline">{linkMatch[1]}</Link>
            {parts[1]}
          </p>
        );
      }
      
      return <p key={idx} className="text-muted-foreground leading-relaxed mb-4 text-lg">{inner}</p>;
    });
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": post.image,
    "datePublished": post.date,
    "author": {
      "@type": "Organization",
      "name": post.author
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      <SEO 
        title={`${post.title} | Eventa Blog`}
        description={post.excerpt}
        url={`https://eventa.in/blog/${post.slug}`}
        image={post.image}
        type="article"
        keywords={`${post.tags.join(', ')}, eventa blog`}
      >
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </SEO>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to all articles
        </Link>
        
        <div className="flex gap-2 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-black leading-tight mb-6">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-6 text-muted-foreground mb-10 pb-10 border-b border-border/50">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="font-medium text-foreground">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {post.image && (
          <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-xl">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <article className="prose prose-invert max-w-none">
          {renderContent(post.content)}
        </article>
      </div>
    </main>
  );
}

export async function getStaticPaths() {
  const paths = BLOG_POSTS.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  
  if (!post) {
    return { notFound: true };
  }
  
  return {
    props: { post },
  };
}
