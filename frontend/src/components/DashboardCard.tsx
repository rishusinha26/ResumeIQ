import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
}

export default function DashboardCard({ title, description, icon, to }: DashboardCardProps) {
  return (
    <MotionLink
      to={to}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="group flex flex-col items-center justify-center p-8 transition-all duration-300 glass-card hover:border-sky-500/30 hover:shadow-2xl shadow-sm"
    >
      <motion.div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/5 text-sky-600 shadow-sm transition-all duration-300 dark:bg-sky-400/10 dark:text-sky-300"
        whileHover={{ rotate: -6, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        {icon}
      </motion.div>
      <div className="mb-1.5 text-lg font-extrabold text-slate-950 dark:text-white leading-tight">{title}</div>
      <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 leading-normal">{description}</div>
    </MotionLink>
  );
}
