'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useEffect } from 'react';

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('w-6 h-6 ', className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn('w-6 h-6 ', className)}>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

type LoadingState = {
  text: string;
};

const LoaderCore = ({ loadingStates, value = 0 }: { loadingStates: LoadingState[]; value?: number }) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.2, 0);

        return (
          <motion.div
            key={index}
            className={cn('text-left flex gap-2 mb-4')}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {index > value && <CheckIcon className="text-gray-950" />}
              {index <= value && <CheckFilled className={cn('text-gray-950', value === index && 'text-primary opacity-100')} />}
            </div>
            <span className={cn('text-gray-500 text-lg font-medium', value === index && 'text-primary opacity-100')}>{loadingState.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop ? (prevState === loadingStates.length - 1 ? 0 : prevState + 1) : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="w-full h-full fixed inset-0 z-100 flex items-center justify-center bg-white"
        >
          {/* Geometric background shapes */}
          {/* <GeometricShapes /> */}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-6">
            {/* Header - Logo */}
            <motion.div
              className="absolute top-40 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="inline-flex items-center bg-primary px-4 py-2 rounded-full">
                <span className="font-genty text-5xl font-bold tracking-wide">
                  <span className="text-white">Merch</span>
                  <span className="text-brand-neon">kins</span>
                </span>
              </h1>
            </motion.div>

            {/* Loader */}
            <div className="h-96">
              <LoaderCore value={currentState} loadingStates={loadingStates} />
            </div>

            {/* Footer - Tagline */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-gray-400 text-sm font-medium">Your one-stop shop for custom merchandise</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
