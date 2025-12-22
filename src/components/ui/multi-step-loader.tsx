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

// Floating geometric shapes component - Light mode version
const GeometricShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large blurred circle - primary/blue */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary/40 blur-[100px]"
        initial={{ x: -200, y: -100 }}
        animate={{
          x: [-200, -150, -200],
          y: [-100, -50, -100],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '10%', left: '5%' }}
      />

      {/* Medium blurred circle - neon green */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-brand-neon/35 blur-[80px]"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ top: '60%', right: '10%' }}
      />

      {/* Small blurred square - primary/blue */}
      <motion.div
        className="absolute w-48 h-48 rounded-3xl bg-primary/30 blur-[60px] rotate-45"
        initial={{ rotate: 45 }}
        animate={{
          rotate: [45, 60, 45],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ bottom: '20%', left: '15%' }}
      />

      {/* Extra large blurred circle - neon green */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-brand-neon/20 blur-[120px]"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ top: '-10%', right: '-5%' }}
      />

      {/* Medium blurred hexagon-ish shape - primary */}
      <motion.div
        className="absolute w-64 h-64 rounded-[40px] bg-primary/35 blur-[70px] rotate-12"
        initial={{ rotate: 12 }}
        animate={{
          rotate: [12, 25, 12],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{ bottom: '5%', right: '25%' }}
      />

      {/* Small floating circle - neon */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-brand-neon/40 blur-[50px]"
        initial={{ y: 0 }}
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ top: '40%', left: '30%' }}
      />

      {/* Another primary shape */}
      <motion.div
        className="absolute w-56 h-56 rounded-full bg-primary/25 blur-[90px]"
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{ top: '25%', right: '35%' }}
      />
    </div>
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
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center bg-white"
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
