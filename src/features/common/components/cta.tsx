'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTAComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="my-12 max-w-5xl mx-auto p-6 rounded-2xl bg-linear-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-primary/20 text-xs font-medium text-primary mb-1">
            <Ticket className="h-3 w-3" />
            <span>Partner with Merchkins</span>
          </div>
          <h3 className="text-xl font-bold font-heading">Ready to sell your own merch?</h3>
          <p className="text-muted-foreground max-w-lg text-sm">
            Open your own storefront on Merchkins and let us handle production, inventory, and fulfillment while you focus on your brand.
          </p>
        </div>
        <Link href="/apply">
          <Button className="h-11 px-6 rounded-full shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all font-semibold">
            Apply Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
