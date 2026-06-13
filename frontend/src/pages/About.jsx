import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function About() {
  return (
    <main className="min-h-[100svh] pt-24 pb-24 relative overflow-hidden">
      <SEO 
        title="About Us" 
        description="Learn more about Eventa, the leading platform for discovering and managing premium events in India."
        url="https://eventa.in/about"
        keywords="about eventa, event management india, premium events platform, tech events company"
      />
      <div className="absolute top-0 inset-x-0 h-[500px] aurora opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mt-12"
        >
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Connecting professionals to the <span className="text-muted-foreground">right events.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Eventa is India's definitive platform for discovering startup, business, technology, culture, and networking events. We aggregate and intelligently curate experiences so you can focus on what matters: growing and connecting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-3xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">Pan-India Reach</h3>
            <p className="text-muted-foreground">
              From the bustling tech hubs of Bengaluru to the financial capitals in Mumbai, we cover the events shaping the nation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">Community First</h3>
            <p className="text-muted-foreground">
              We believe in the power of bringing people together. Our platform is built to foster meaningful connections across industries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-3xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">AI-Powered</h3>
            <p className="text-muted-foreground">
              We use advanced artificial intelligence to recommend events that align perfectly with your career goals and personal interests.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 rounded-3xl border border-border bg-card p-12 text-center"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Ready to explore?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of professionals who use Eventa to discover their next big opportunity.
          </p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-8 py-4 text-sm font-semibold hover:scale-105 transition-transform">
            Discover Events <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
