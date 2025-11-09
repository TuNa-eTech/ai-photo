import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function GlassCard({ children, className = '', hover = false, padding = 'md' }: GlassCardProps) {
  const paddingClasses = {
    sm: 'p-4 md:p-5',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const baseClasses = `glass-card ${paddingClasses[padding]}`;
  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (hover) {
    return (
      <motion.div
        className={combinedClasses}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={combinedClasses}>{children}</div>;
}

