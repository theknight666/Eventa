import React from "react";
import { motion } from "framer-motion";
import { Handshake, Building, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Partnerships() {
  return (
    <main className="min-h-[100svh] pt-24 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-[600px] w-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/4" />
      
      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mt-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm font-medium mb-6">
            <Sparkles size={16} /> Partner with Eventa
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Let's grow <span className="text-muted-foreground">together.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Reach India's most ambitious professionals. We partner with brands, venues, and media companies to create high-impact integrations and premium event experiences.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-8 py-4 text-sm font-semibold hover:scale-105 transition-transform">
            Start a Conversation
          </Link>
        </motion.div>

        <div className="mt-32">
          <h2 className="text-3xl font-display font-bold text-center mb-16">Why partner with us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass p-8 rounded-3xl flex flex-col items-center text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Premium Audience</h3>
              <p className="text-muted-foreground">
                Gain direct access to highly engaged professionals, founders, and executives across India.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass p-8 rounded-3xl flex flex-col items-center text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
                <Building size={32} />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Brand Authority</h3>
              <p className="text-muted-foreground">
                Align your brand with top-tier events in technology, business, and innovation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass p-8 rounded-3xl flex flex-col items-center text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
                <Handshake size={32} />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Tailored Solutions</h3>
              <p className="text-muted-foreground">
                From sponsored categories to featured placements, we build bespoke campaigns that drive ROI.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
