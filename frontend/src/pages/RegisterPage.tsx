import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('candidate');
    setError('');
    setSubmitting(false);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, fullName, role);
      navigate(role === 'candidate' ? '/student' : '/recruiter');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Create account</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Get started checking ATS scores or finding candidates.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="off">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">I am a</span>
            <div className="grid grid-cols-2 gap-2">
              <RoleOption
                active={role === 'candidate'}
                label="Student"
                onClick={() => setRole('candidate')}
              />
              <RoleOption
                active={role === 'recruiter'}
                label="Recruiter"
                onClick={() => setRole('recruiter')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="glass-input"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

function RoleOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none',
        active 
          ? 'border-transparent bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20' 
          : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
