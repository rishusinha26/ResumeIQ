import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CustomCursor from '../components/CustomCursor';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const recruiterNav = [
  { to: '/recruiter', label: 'Dashboard', end: true },
  { to: '/jobs/upload', label: 'Upload Jobs' },
  { to: '/recommendations/candidates', label: 'Find Candidates' },
  { to: '/chatbot', label: 'Assistant' },
];

const studentNav = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/resume', label: 'My Resume' },
  { to: '/student/ats', label: 'ATS Score' },
  { to: '/student/roles', label: 'Suggested Roles' },
  { to: '/student/dsa', label: 'Company DSA' },
  { to: '/student/aptitude', label: 'Aptitude Prep' },
  { to: '/student/career', label: 'Career Assistant' },
  { to: '/student/chatbot', label: 'Resume Coach' },
];

const adminNav = [
  { to: '/admin', label: 'Admin', end: true },
  { to: '/recruiter', label: 'Recruiter View' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'candidate' ? studentNav : user?.role === 'admin' ? adminNav : recruiterNav;

  const portalTitle =
    user?.role === 'candidate' ? 'Student Portal' : user?.role === 'admin' ? 'Admin Portal' : 'Recruiter Portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-shell min-h-screen relative overflow-hidden text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <motion.div
        className="absolute top-[-10%] left-[-10%] bg-mesh-slate"
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] bg-mesh-blue"
        animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-[calc(100vh-3rem)] sticky top-6"
        >
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-sky-700 text-base font-bold text-white shadow-md shadow-slate-900/20"
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  A
                </motion.div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">ResumeIQ</p>
                  <h1 className="text-base font-bold tracking-tight text-slate-950 dark:text-white leading-none mt-0.5">{portalTitle}</h1>
                </div>
              </div>
              {user ? (
                <motion.div
                  className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/50 dark:bg-slate-900/50"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{user.role}</p>
                </motion.div>
              ) : null}
            </div>
            
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-slate-900 to-sky-700 text-white shadow-md shadow-slate-900/20 dark:shadow-sky-900/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            {/* Theme Toggle Button */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-200 dark:bg-violet-600"
              >
                <span className="sr-only">Toggle theme</span>
                <span
                  className={[
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center',
                    dark ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                >
                  {dark ? (
                    <svg className="h-3.5 w-3.5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/40 px-4 py-3 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </motion.aside>

        <main className="glass-panel rounded-3xl p-6 h-[calc(100vh-3rem)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
