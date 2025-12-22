'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function CodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Query product by code when searchCode is set
  const product = useQuery(api.products.queries.index.getProductByCode, searchCode ? { code: searchCode.toUpperCase() } : 'skip');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please enter a product code');
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Minimalist geometric accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-px h-32 bg-linear-to-b from-transparent via-[#1d43d8]/20 to-transparent" />
        <div className="absolute bottom-1/3 left-1/3 w-32 h-px bg-linear-to-r from-transparent via-brand-neon/30 to-transparent" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-slate-100 dark:border-slate-800"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-sm relative z-10">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-slate-400"
            >
              <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
              Quick Access
              <span className="w-8 h-px bg-slate-300 dark:bg-slate-600" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold font-heading text-slate-900 dark:text-white tracking-tight"
            >
              Enter Code
            </motion.h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
            >
              <Input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="MERCH001"
                className="h-16 text-2xl mt-4 font-medium text-center uppercase tracking-[0.15em] bg-transparent border border-slate-400 dark:border-slate-700 rounded-full focus:ring-0 focus:border-[#1d43d8] transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                disabled={isLoading}
                autoFocus
              />

              {/* Accent dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: code ? 1 : 0 }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-neon"
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-red-500 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex justify-center"
            >
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
                variant="ghost"
                className="px-16! py-6 text-base font-medium text-[#1d43d8] hover:text-[#1d43d8] hover:bg-[#1d43d8]/5 rounded-full border border-[#1d43d8]/20 hover:border-[#1d43d8]/40 transition-all disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    Go to Product
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mt-4 text-xs text-slate-400 tracking-wide"
          >
            Enter the unique code found on your product
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
