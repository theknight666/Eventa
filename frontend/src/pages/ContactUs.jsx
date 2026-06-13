import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import SEO from "../components/SEO";

export default function ContactUs() {
  return (
    <main className="min-h-[100svh] pt-24 pb-24 relative overflow-hidden">
      <SEO 
        title="Contact Us" 
        description="Have a question about Eventa, want to list an event, or just want to say hi? We'd love to hear from you."
        url="https://eventa.in/contact"
      />
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-foreground/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mt-12"
        >
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Get in touch
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Have a question about our platform, want to list an event, or just want to say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shrink-0">
                <Mail size={20} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email Us</h3>
                <p className="text-muted-foreground mb-2">For general inquiries and support.</p>
                <a href="mailto:hello@eventa.in" className="text-foreground font-medium hover:underline">
                  hello@eventa.in
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Visit Us</h3>
                <p className="text-muted-foreground mb-2">Our headquarters.</p>
                <p className="text-foreground font-medium">
                  WeWork Galaxy,<br />
                  43 Residency Road,<br />
                  Bengaluru, Karnataka 560025
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shrink-0">
                <Phone size={20} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Call Us</h3>
                <p className="text-muted-foreground mb-2">Mon-Fri from 9am to 6pm.</p>
                <a href="tel:+919876543210" className="text-foreground font-medium hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass p-8 rounded-3xl"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input type="email" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea rows="4" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-foreground text-background px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
