'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LandingNavbar as Navbar, NavBody, useNavbarScroll } from '@/src/components/ui/resizable-navbar';

const navLinks = [
  { name: 'About Us', link: '#about' },
  { name: 'Features', link: '#features' },
  { name: 'Services', link: '#services' },
  { name: 'Contact', link: '#contact' },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Navbar
        className="transition-all duration-300"
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <LandingHeaderContent mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Navbar>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.link}
                    href={link.link}
                    className="px-4 py-3 text-lg font-medium text-white/80 hover:text-brand-neon hover:bg-white/5 rounded-xl transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </motion.a>
                ))}
                <Link
                  href="https://app.merchkins.com"
                  className="mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-brand-neon text-slate-900 text-base font-bold rounded-full hover:bg-[#bbfd2d] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function LandingHeaderContent({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void }) {
  const { isScrolled } = useNavbarScroll();

  return (
    <NavBody>
      {/* Logo */}
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Link href="/landing" className="flex items-center gap-2 font-bold tracking-tight transition-all duration-300 group relative">
          {!isScrolled && (
            <>
              {/* Decorative sparkle near logo */}
              <motion.div
                className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-3 w-3 text-brand-neon" />
              </motion.div>
            </>
          )}

          <span
            className={cn(
              'text-2xl md:text-3xl font-bold! tracking-tighter relative z-10 transition-all duration-300 whitespace-nowrap font-genty',
              !isScrolled && 'group-hover:drop-shadow-[0_0_8px_rgba(173,252,4,0.5)]'
            )}
          >
            <span className="text-white">Merch</span>
            <span className="text-brand-neon">kins</span>
          </span>
        </Link>
      </motion.div>

      {/* Desktop Navigation */}
      {!isScrolled && (
        <nav className="hidden md:flex items-center gap-1 mx-4">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.link}
              href={link.link}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-brand-neon transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
            >
              {link.name}
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-neon scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </motion.a>
          ))}
        </nav>
      )}

      {/* Right side - CTA and Mobile Toggle */}
      <div className="flex items-center gap-4">
        {/* CTA Button */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <Link
            href="https://app.merchkins.com"
            className={cn(
              'hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all shadow-lg hover:-translate-y-0.5',
              isScrolled
                ? 'bg-brand-neon text-slate-900 hover:bg-[#bbfd2d] shadow-brand-neon/25'
                : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20'
            )}
          >
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </NavBody>
  );
}
