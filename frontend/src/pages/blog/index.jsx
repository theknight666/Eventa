import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog";
import SEO from "@/components/SEO";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogList() {
  return (
    <main className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      <SEO 
        title="Eventa Blog | Event Industry Insights & Guides" 
        description="Read the latest articles, guides, and insights about the event industry, startups, technology conferences, and networking in India."
        url="https://eventa.in/blog"
        keywords="eventa blog, event industry news, startup events guide, tech conferences india"
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-display font-black mb-4">Eventa Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Insights, guides, and news from India's premium event discovery platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group block rounded-3xl border border-border bg-card overflow-hidden hover:border-foreground/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
