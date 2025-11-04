import type { Variants, Easing } from 'framer-motion';

/**
 * Configuration options for fade-in-up animations
 */
export interface FadeInUpOptions {
  /** Duration in seconds (default: 0.6) */
  duration?: number;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** Y offset distance in pixels (default: 20) */
  distance?: number;
  /** Easing function (default: cubic-bezier(0.16, 1, 0.3, 1)) */
  easing?: Easing | Easing[];
}

/**
 * Default fade-in-up animation configuration
 */
const DEFAULT_OPTIONS: Required<FadeInUpOptions> = {
  duration: 0.6,
  delay: 0,
  distance: 20,
  easing: [0.16, 1, 0.3, 1],
};

/**
 * Creates a fade-in-up animation variant with customizable options
 * @param options - Animation configuration options
 * @returns Framer Motion variant object
 */
export function createFadeInUpVariant(options: FadeInUpOptions = {}): Variants {
  const config = { ...DEFAULT_OPTIONS, ...options };
  return {
    initial: {
      opacity: 0,
      y: config.distance,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: config.duration,
        delay: config.delay,
        ease: config.easing,
      },
    },
    exit: {
      opacity: 0,
      y: config.distance,
      transition: {
        duration: config.duration * 0.5,
        ease: config.easing,
      },
    },
  };
}

/**
 * Default fade-in-up animation variant
 * opacity: 0 → 1, translateY: 20px → 0
 */
export const fadeInUp: Variants = createFadeInUpVariant();

/**
 * Container variant for staggered children animations
 * Use this on parent containers to animate children with delays
 */
export const fadeInUpContainer: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Pre-configured variants for common use cases
 */
export const fadeInUpVariants = {
  /** Very subtle animation (10px distance, 0.4s duration) */
  subtle: createFadeInUpVariant({ distance: 10, duration: 0.4 }),
  /** Standard animation (default) */
  standard: fadeInUp,
  /** More pronounced animation (30px distance, 0.8s duration) */
  pronounced: createFadeInUpVariant({ distance: 30, duration: 0.8 }),
};
