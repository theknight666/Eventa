import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border" data-testid="footer">
      <div className="absolute inset-0 aurora opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-extrabold tracking-tight">
              eventa<span className="text-muted-foreground">.in</span>
            </div>
            <p className="mt-4 max-w-sm text-muted-foreground">
              India's definitive platform to discover startup, business,
              technology, culture and networking events — intelligently
              aggregated in one place.
            </p>
          </div>
          <div>
            <p className="label-eyebrow text-muted-foreground">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#trending" className="hover:text-foreground transition-colors">Trending Events</Link></li>
              <li><Link href="/#categories" className="hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link href="/#cities" className="hover:text-foreground transition-colors">Featured Cities</Link></li>
              <li><Link href="/#ai-picks" className="hover:text-foreground transition-colors">AI Recommendations</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-eyebrow text-muted-foreground">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex flex-col">
              <li><Link href="/organizer" className="hover:text-foreground transition-colors">For Organizers</Link></li>
              <li><Link href="/partnerships" className="hover:text-foreground transition-colors">Partnerships</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} Eventa. Made with ❤️ in India by</span>
            <a href="https://www.seoplanet.in" target="_blank" rel="noopener noreferrer" className="inline-flex">
              {/* Image for light mode (black text) */}
              <img src="/seo-planet-black.png" alt="SEO Planet" className="h-[12px] transform translate-y-[1px] object-contain rounded-[2px] hover:opacity-80 transition-opacity dark:hidden block" />
              {/* Image for dark mode (white text) */}
              <img src="/seo-planet.png" alt="SEO Planet" className="h-[12px] transform translate-y-[1px] object-contain rounded-[2px] hover:opacity-80 transition-opacity hidden dark:block" />
            </a>
          </div>
          <span className="label-eyebrow">Discover · Connect · Grow</span>
        </div>
      </div>
    </footer>
  );
}
