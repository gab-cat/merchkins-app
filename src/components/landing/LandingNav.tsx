'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const navLinks = [
  { href: '#about', label: 'About Us' },
  { href: '#features', label: 'Features' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80; // Account for sticky header height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    setMobileMenuOpen(false);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-[#1d43d8] flex items-center justify-center shadow-lg shadow-[#1d43d8]/25 group-hover:shadow-[#1d43d8]/40 transition-shadow">
                <span className="font-genty text-brand-neon text-lg">M</span>
              </div>
            </div>
            <span className="font-heading font-bold text-xl text-slate-900 hidden sm:block">Merchkins</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#1d43d8] transition-colors relative group cursor-pointer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1d43d8] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </motion.a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
              <Link
                href="/sign-up"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d43d8] text-white text-sm font-semibold rounded-full hover:bg-[#1638b0] transition-all shadow-lg shadow-[#1d43d8]/25 hover:shadow-[#1d43d8]/40 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="px-4 py-3 text-base font-medium text-slate-600 hover:text-[#1d43d8] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
              <Link
                href="/sign-up"
                className="mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-[#1d43d8] text-white text-base font-semibold rounded-xl hover:bg-[#1638b0] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
