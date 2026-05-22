import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 py-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/60">
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="font-bold text-xl tracking-tight text-slate-900 dark:text-white"
        >
          ResumeIQ
        </motion.div>
      </header>
      <main className="flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard-shell-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
