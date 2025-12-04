'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { AccountSettingsForm } from '../components/account-settings-form';
import { BlurFade } from '@/src/components/ui/animations/effects';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function AccountSettingsView() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <BlurFade delay={0.1}>
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#1d43d8]/10">
                  <Settings className="h-5 w-5 text-[#1d43d8]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">Account Settings</h1>
                  <p className="text-slate-500 text-sm">Manage your profile and preferences</p>
                </div>
              </div>
            </motion.div>
          </BlurFade>

          {/* Form */}
          <BlurFade delay={0.15}>
            <AccountSettingsForm />
          </BlurFade>
        </motion.div>
      </div>
    </div>
  );
}
