'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function LandingFooter() {
  return (
    <motion.footer
      className="py-12 md:py-16 bg-white border-t border-slate-100"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/landing" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-[#1d43d8] flex items-center justify-center shadow-lg shadow-[#1d43d8]/25">
                <span className="font-genty text-[#adfc04] text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">Merchkins</span>
            </Link>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="text-sm text-slate-500">© {new Date().getFullYear()} Merchkins. All rights reserved.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-600 hover:text-[#1d43d8] transition-colors inline-flex items-center gap-1">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-[#1d43d8] transition-colors inline-flex items-center gap-1">
              Terms of Service
            </a>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#1d43d8] hover:text-[#1638b0] transition-colors"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
