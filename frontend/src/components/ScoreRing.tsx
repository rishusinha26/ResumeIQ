import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Custom theme colors for score ranges
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      className="relative inline-flex items-center justify-center transition-all duration-300"
      style={{ width: size, height: size }}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          className="stroke-slate-100 dark:stroke-slate-800/80" 
          strokeWidth="10" 
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        className="absolute text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(score)}%</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Match</p>
      </motion.div>
    </motion.div>
  );
}
