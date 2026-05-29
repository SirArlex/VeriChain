import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'cyan' | 'green' | 'red' | 'none';
  onClick?: () => void;
}

const glowMap = {
  blue: 'hover:shadow-glow-blue hover:border-blue-500/30',
  cyan: 'hover:shadow-glow-cyan hover:border-cyan-400/30',
  green: 'hover:shadow-glow-green hover:border-green-400/30',
  red: 'hover:shadow-glow-red hover:border-red-400/30',
  none: '',
};

/**
 * Glassmorphism card used throughout the UI.
 * Supports hover glow effects and optional click handler.
 */
export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = 'none',
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={clsx(
        'glass-card transition-all duration-300',
        hover && 'cursor-pointer',
        glow !== 'none' && glowMap[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
