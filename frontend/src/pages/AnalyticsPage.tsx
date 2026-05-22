import { useEffect, useMemo, useState } from 'react';
import { BriefcaseIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';

import { fetchCandidates, fetchJobs, fetchResumes } from '../api/ats';
import BarChart from '../components/charts/BarChart';
import StatCard from '../components/charts/StatCard';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';

export default function AnalyticsPage() {
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState<Awaited<ReturnType<typeof fetchResumes>>>([]);
  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof fetchJobs>>>([]);
  const [candidates, setCandidates] = useState<Awaited<ReturnType<typeof fetchCandidates>>>([]);

  useEffect(() => {
    Promise.all([fetchResumes(), fetchJobs(), fetchCandidates()])
      .then(([r, j, c]) => {
        setResumes(r);
        setJobs(j);
        setCandidates(c);
      })
      .catch(() => setError('Could not load analytics data.'));
  }, []);

  const skillCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const resume of resumes) {
      for (const skill of resume.skills) {
        counts[skill] = (counts[skill] || 0) + 1;
      }
    }
    for (const job of jobs) {
      for (const skill of job.skills) {
        counts[skill] = (counts[skill] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [resumes, jobs]);

  const topSkills = skillCounts.map(([skill]) => skill);
  const topSkillsCounts = skillCounts.map(([, count]) => count);

  return (
    <section className="space-y-8">
      <PageHeader title="Analytics" description="Live insights from resumes, jobs, and candidates in your ATS." />
      <StatusMessage type="error" message={error} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resumes" value={resumes.length} icon={<DocumentTextIcon className="h-7 w-7" />} />
        <StatCard label="Jobs" value={jobs.length} icon={<BriefcaseIcon className="h-7 w-7" />} />
        <StatCard label="Candidates" value={candidates.length} icon={<UserGroupIcon className="h-7 w-7" />} />
        <StatCard
          label="Top skill"
          value={topSkills[0] || '—'}
          icon={<BriefcaseIcon className="h-7 w-7" />}
        />
      </div>

      {topSkills.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Top skills across resumes & jobs</h3>
          <BarChart title="Skill frequency" labels={topSkills} data={topSkillsCounts} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Upload resumes and jobs to see skill analytics.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ListPanel title="Recent resumes" items={resumes.map((r) => `${r.filename} — ${r.skills.length} skills`)} />
        <ListPanel title="Recent jobs" items={jobs.map((j) => `${j.filename} — ${j.skills.length} skills`)} />
      </div>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {items.slice(0, 8).map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
