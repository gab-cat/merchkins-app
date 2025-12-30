'use client';

import React from 'react';
import { MultiStepLoader } from '@/src/components/ui/multi-step-loader';

// Customer-focused loading states for buyers
const loadingStates = [
  { text: 'Finding the latest merch for you' },
  { text: 'Discovering exclusive collections' },
  { text: 'Loading trending designs' },
  { text: 'Curating personalized picks' },
  { text: 'Checking available sizes' },
  { text: 'Preparing your shopping experience' },
  { text: 'Fetching the freshest drops' },
  { text: 'Organizing storefronts' },
  { text: 'Syncing your preferences' },
  { text: 'Almost ready to explore' },
];

interface GlobalLoadingProps {
  className?: string;
}

export function GlobalLoading({ className: _className }: GlobalLoadingProps) {
  return <MultiStepLoader loadingStates={loadingStates} loading={true} duration={1500} loop={true} />;
}
