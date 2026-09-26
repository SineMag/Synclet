import React from 'react';
import { motion } from 'framer-motion';
import { Siren } from 'lucide-react';

export default function AlertBanner({ code }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      className="shrink-0 bg-critical text-destructive-foreground overflow-hidden"
      role="alert"
    >
      <div className="flex items-center gap-3 px-4 py-2 font-mono text-sm font-semibold tracking-wider animate-pulse">
        <Siren className="w-4 h-4" />
        NEW CRITICAL INCIDENT RECEIVED — {code}
      </div>
    </motion.div>
  );
}