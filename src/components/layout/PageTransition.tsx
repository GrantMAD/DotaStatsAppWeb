'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: -80, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ 
        type: 'spring', 
        stiffness: 70, 
        damping: 20,
        mass: 1,
        duration: 1.0
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
