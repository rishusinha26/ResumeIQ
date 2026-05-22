import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setSubmitting(false);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell flex min-h-screen items-center justify-center p-6 relative overflow-hidden text-slate-900 transition-colors duration-300">
      {/* Background Mesh Orbs */}
      <div className="absolute top-[-10%] left-[-10%] bg-mesh-sky"></div>
      <div className="absolute bottom-[-10%] right-[-10%] bg-mesh-blue"></div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl bg-white/80">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/20">
            A
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-700">ResumeIQ</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Check ATS fit or manage candidate recommendations.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="off">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="glass-input"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="glass-input"
              required
              minLength={8}
            />
          </div>
          {error ? <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full glass-btn-primary mt-2"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No account?{' '}
          <Link to="/register" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
