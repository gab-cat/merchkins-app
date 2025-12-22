'use client';

import { MultiStepLoader } from '@/src/components/ui/multi-step-loader';

// Merchkins-themed loading states
const loadingStates = [
  { text: 'Setting up your storefront...' },
  { text: 'Loading your custom merch...' },
  { text: 'Preparing the shopping experience...' },
  { text: 'Curating your collection...' },
  { text: 'Almost there...' },
];

export default function TestLoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MultiStepLoader loadingStates={loadingStates} loading={true} duration={1500} loop={true} />
    </div>
  );
}
