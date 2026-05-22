import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { DashboardOverview, fetchDashboardOverview } from '../api/ats';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';

const quickLinks = [
  { to: '/resumes/upload', label: 'Upload resume' },
  { to: '/jobs/upload', label: 'Upload job' },
  { to: '/recommendations/candidates', label: 'Match candidates' },
  { to: '/chatbot', label: 'Open assistant' },
];

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardOverview()
      .then(setOverview)
      .catch(() => setError('Could not load dashboard stats.'));
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Overview</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">ATS command center</h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Upload resumes and jobs, review matches, and chat with the recruiter assistant.
        </p>
      </div>

      <StatusMessage type="error" message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Resumes in system" value={overview?.total_resumes ?? '—'} />
        <StatCard label="Job descriptions" value={overview?.total_jobs ?? '—'} />
        <StatCard label="Registered candidates" value={overview?.total_candidates ?? '—'} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <PageHeader title="Quick actions" description="Jump straight into the workflows you use most." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
