import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <motion.h2
        className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02, duration: 0.35 }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="mt-2 max-w-2xl text-sm font-medium text-slate-600 dark:text-slate-400"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
