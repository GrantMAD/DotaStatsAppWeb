'use client';

import { motion, HTMLMotionProps, TargetAndTransition, VariantLabels, Transition } from 'framer-motion';
import React from 'react';

type AnimationWrapperProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  animationType?: 'fade-in' | 'scale-hover' | 'slide-up';
};

interface AnimationConfig {
  initial?: TargetAndTransition | VariantLabels | boolean;
  animate?: TargetAndTransition | VariantLabels | boolean;
  whileHover?: TargetAndTransition | VariantLabels;
  whileTap?: TargetAndTransition | VariantLabels;
  transition?: Transition;
}

const animations: Record<string, AnimationConfig> = {
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  'scale-hover': {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  animationType = 'fade-in',
  ...props
}) => {
  return (
    <motion.div
      {...animations[animationType]}
      {...props}
    >
      {children}
    </motion.div>
  );
};
