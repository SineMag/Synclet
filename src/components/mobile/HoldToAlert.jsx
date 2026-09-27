import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Siren } from 'lucide-react';

const HOLD_MS = 1200;

export default function HoldToAlert({ onTrigger, disabled }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef();

  const start = () => {
    if (disabled) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onTrigger();
    }, HOLD_MS);
  };
  const stop = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => e.key === 'Enter' && !e.repeat && !disabled && onTrigger()}
      aria-label="Trigger safety alert. Press and hold, or press Enter."
      className="relative w-full h-16 overflow-hidden rounded-md border border-critical/50 bg-critical/5 text-critical font-semibold select-none touch-none disabled:opacity-60"
    >
      <motion.span
        className="absolute inset-y-0 left-0 bg-critical"
        initial={false}
        animate={{ width: holding ? '100%' : '0%' }}
        transition={{ duration: holding ? HOLD_MS / 1000 : 0.2, ease: 'linear' }}
      />
      <span className={`relative flex items-center justify-center gap-2 ${holding ? 'text-destructive-foreground' : ''}`}>
        <Siren className="w-5 h-5" />
        {disabled ? 'Sending alert…' : holding ? 'Keep holding…' : 'Hold to trigger safety alert'}
      </span>
    </button>
  );
}