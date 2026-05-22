import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="auth-shell auth-shell--light flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        className="auth-shell__glow auth-shell__glow--left"
        animate={{ y: [0, -18, 0], opacity: [0.36, 0.58, 0.36] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-shell__glow auth-shell__glow--right"
        animate={{ y: [0, 16, 0], opacity: [0.28, 0.52, 0.28] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
