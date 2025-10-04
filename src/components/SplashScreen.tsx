
'use client';

import { motion } from 'framer-motion';
import { Beaker } from 'lucide-react';

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-0">
          <Beaker className="h-16 w-16 text-primary" />
          <h1 className="-ml-2 text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ABG AI Analyzer
          </h1>
        </div>
      </motion.div>
    </motion.div>
  );
}
