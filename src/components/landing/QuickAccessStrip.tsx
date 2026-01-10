'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Hash, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickAccessStrip() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Query product by code when searchCode is set
  const product = useQuery(api.products.queries.index.getProductByCode, searchCode ? { code: searchCode.toUpperCase() } : 'skip');

  // Fetch top categories for quick chips
  const categoriesResult = useQuery(api.categories.queries.index.getPopularCategories, {
    limit: 6,
    includeEmpty: false,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Enter a code');
      return;
    }

    setSearchCode(code.trim().toUpperCase());
  };

  // Effect to handle navigation when product is found
  React.useEffect(() => {
    if (searchCode && product !== undefined) {
      if (product === null) {
        setError('Code not found');
        setSearchCode('');
      } else if (product.organizationInfo?.slug && product.slug) {
        startTransition(() => {
          router.push(`/o/${product.organizationInfo!.slug}/p/${product.slug}`);
        });
      }
    }
  }, [product, searchCode, router]);

  const isLoading = (searchCode && product === undefined) || isPending;
  const categories = categoriesResult ?? [];

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden">
      {/* Architectural geometric backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary circle - large, subtle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-100 dark:border-slate-800/50"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Secondary circle - offset */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[60%] w-[300px] h-[300px] rounded-full border border-slate-50 dark:border-slate-900"
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.5 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Accent line - vertical */}
        <div className="absolute top-1/4 right-1/3 w-px h-20 bg-linear-to-b from-transparent via-[#1d43d8]/20 to-transparent" />
        {/* Accent line - horizontal */}
        <div className="absolute bottom-1/3 left-1/4 w-16 h-px bg-linear-to-r from-transparent via-brand-neon/30 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 text-xs font-medium tracking-[0.25em] uppercase text-slate-400 mb-4">
            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
            Quick Access
            <span className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">Enter Product Code</h2>
        </motion.div>

        {/* Code Entry - Hero Element */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative w-full sm:w-auto">
              <label htmlFor="quick-access-code-id" className="sr-only">
                Quick access code
              </label>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                <Hash className="h-5 w-5" />
              </div>
              <Input
                id="quick-access-code-id"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="MERCH001"
                className={cn(
                  'w-full sm:w-56 h-14 pl-11 pr-4 text-xl font-medium uppercase tracking-[0.15em] text-center sm:text-left',
                  'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-full',
                  'focus:ring-0 focus:border-[#1d43d8] focus:shadow-lg focus:shadow-[#1d43d8]/10',
                  'transition-all duration-300',
                  'placeholder:text-slate-300 dark:placeholder:text-slate-600',
                  error && 'border-red-300 dark:border-red-800 focus:border-red-400'
                )}
                disabled={isLoading}
                autoComplete="off"
                aria-describedby={error ? 'quick-access-code-error' : undefined}
              />
              {/* Active indicator dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: code ? 1 : 0 }}
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-neon shadow-lg shadow-brand-neon/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
              className={cn(
                'h-14 px-8 rounded-full font-semibold text-base',
                'bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white',
                'shadow-lg shadow-[#1d43d8]/25 hover:shadow-xl hover:shadow-[#1d43d8]/30',
                'transition-all duration-300 hover:-translate-y-0.5',
                'disabled:opacity-50 disabled:shadow-none disabled:translate-y-0'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Go to Product
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                id="quick-access-code-error"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-center gap-2 text-red-500 text-sm mt-4"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Pills - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Or browse by category</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.05, duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Link
                  href={`/c/${cat.slug}`}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                    'text-sm font-medium text-slate-600 dark:text-slate-400',
                    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
                    'hover:border-[#1d43d8]/40 hover:text-[#1d43d8] hover:shadow-md hover:shadow-[#1d43d8]/10',
                    'hover:-translate-y-0.5',
                    'transition-all duration-300'
                  )}
                >
                  <span>{cat.name}</span>
                  {cat.activeProductCount !== undefined && cat.activeProductCount > 0 && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {cat.activeProductCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + categories.length * 0.05, duration: 0.4 }}
            >
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1d43d8] hover:text-[#1d43d8]/80 transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
