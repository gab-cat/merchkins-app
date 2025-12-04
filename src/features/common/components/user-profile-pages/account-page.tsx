import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { AccountSettingsForm } from '@/src/features/account/components/account-settings-form';
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

export function AccountPage() {
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-2 py-4">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header - compact for modal */}
          <BlurFade delay={0.1}>
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-[#1d43d8]/10">
                  <Settings className="h-4 w-4 text-[#1d43d8]" />
                </div>
                <h2 className="text-lg font-bold font-heading tracking-tight text-slate-900">Account Settings</h2>
              </div>
              <p className="text-slate-500 text-xs ml-8">Manage your profile and preferences</p>
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
