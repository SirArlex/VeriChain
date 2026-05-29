import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'cyan' | 'green' | 'red' | 'amber' | 'purple' | 'ghost';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantMap = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ghost: 'bg-white/5 text-white/50 border-white/10',
};

const dotMap = {
  blue: 'bg-blue-400',
  cyan: 'bg-cyan-400',
  green: 'bg-green-400',
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  purple: 'bg-purple-400',
  ghost: 'bg-white/40',
};

export default function Badge({
  children,
  variant = 'blue',
  size = 'sm',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 border rounded-full font-mono font-medium',
        variantMap[variant],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotMap[variant])} />
      )}
      {children}
    </span>
  );
}
