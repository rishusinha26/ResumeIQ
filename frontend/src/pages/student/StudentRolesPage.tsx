import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { SuggestedRole, fetchSuggestedRoles } from '../../api/student';
import { PageHeader } from '../../components/PageHeader';
import { SkillTags } from '../../components/SkillTags';
import { StatusMessage } from '../../components/StatusMessage';

export default function StudentRolesPage() {
  const [roles, setRoles] = useState<SuggestedRole[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedRoles()
      .then((data) => setRoles(data.roles))
      .catch(() => setError('Upload your resume first to get role suggestions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Suggested Job Roles"
        description="Based on skills and experience in your resume, these roles may be a strong fit for you."
      />
      <StatusMessage type="error" message={error} />

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400 font-semibold">
          <svg className="w-6 h-6 animate-spin mr-2 text-violet-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Analyzing your resume...
        </div>
      ) : roles.length === 0 ? (
        <div className="glass-card p-6">
          <p className="text-slate-600 dark:text-slate-400 font-medium">No suggestions yet.</p>
          <Link to="/student/resume" className="mt-3 inline-block text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            Upload resume →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <div key={role.role_title} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{role.role_title}</h3>
                <span className="rounded-full bg-violet-100 dark:bg-violet-950/40 border border-violet-200/10 px-3 py-1 text-xs font-bold text-violet-800 dark:text-violet-300 shrink-0">
                  {role.confidence}% fit
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{role.reason}</p>
              {role.matched_skills.length > 0 ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Supporting skills
                  </p>
                  <SkillTags skills={role.matched_skills} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <StatusMessage
        type="info"
        message="Tip: Add missing keywords from the ATS Score page to your resume to improve match rates."
      />
      <Link
        to="/student/ats"
        className="inline-block glass-btn-primary"
      >
        Check ATS scores for open jobs →
      </Link>
    </section>
  );
}
