'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  splitType?: 'chars' | 'words';
  once?: boolean;
}

export function SplitText({ text, className, delay = 0.05, duration = 0.5, tag: Tag = 'p', splitType = 'words', once = true }: SplitTextProps) {
  const items = splitType === 'chars' ? text.split('') : text.split(' ');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={cn('inline-flex flex-wrap', className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          className={cn('inline-block', splitType === 'words' && 'mr-[0.25em]', splitType === 'chars' && item === ' ' && 'mr-[0.25em]')}
        >
          {item}
          {splitType === 'chars' && item === ' ' ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
}
