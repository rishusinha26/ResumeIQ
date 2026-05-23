import { useEffect, useState, type ReactNode } from 'react';

import { JobATSAnalysis, analyzeJob, fetchJobMatches } from '../../api/student';
import { PageHeader } from '../../components/PageHeader';
import { ScoreRing } from '../../components/ScoreRing';
import { SkillTags } from '../../components/SkillTags';
import { StatusMessage } from '../../components/StatusMessage';

export default function StudentATSPage() {
  const [matches, setMatches] = useState<JobATSAnalysis[]>([]);
  const [selected, setSelected] = useState<JobATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    fetchJobMatches()
      .then((data) => {
        setMatches(data.matches);
        if (data.matches.length > 0) {
          setSelected(data.matches[0]);
        } else {
          setInfo('No jobs available yet, or upload your resume first.');
        }
      })
      .catch((err: unknown) => {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? String((err as { response?: { data?: { detail?: string } } }).response?.data?.detail)
            : '';
        setError(msg || 'Upload your resume first, then check back for job matches.');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectJob = async (jobId: string) => {
    const cached = matches.find((m) => m.job_id === jobId);
    if (cached) {
      setSelected(cached);
      return;
    }
    setDetailLoading(true);
    try {
      const data = await analyzeJob(jobId);
      setSelected(data.analysis);
    } catch {
      setError('Could not analyze this job.');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400 font-semibold">
        <svg className="w-6 h-6 animate-spin mr-2 text-violet-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading ATS analysis...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="ATS Score & Job Fit"
        description="See how suitable your resume is for each role, missing keywords, and match breakdown."
      />
      <StatusMessage type="error" message={error} />
      <StatusMessage type="info" message={info} />

      {matches.length > 0 && selected ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-8 glass-card p-6">
              <ScoreRing score={selected.ats_score} size={140} />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Role</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">{selected.job_title}</h3>
                <p className="mt-2 text-base font-bold text-violet-600 dark:text-violet-400">{selected.suitability}</p>
                <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
                  <Metric label="Keyword match" value={`${selected.keyword_match_percent}%`} />
                  <Metric label="Model similarity" value={`${selected.similarity_score}%`} />
                </div>
              </div>
            </div>

            <AnalysisBlock title="Matched keywords" type="success">
              <SkillTags skills={selected.matched_keywords} />
            </AnalysisBlock>

            <AnalysisBlock title="Missing keywords (add these to improve ATS score)" type="warning">
              {selected.missing_keywords.length > 0 ? (
                <SkillTags skills={selected.missing_keywords} />
              ) : (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Great — you cover all key skills for this role!</p>
              )}
            </AnalysisBlock>

            <AnalysisBlock title="Skills required for this job" type="neutral">
              <SkillTags skills={selected.job_skills} />
            </AnalysisBlock>
          </div>

          <div className="glass-panel p-4 rounded-3xl h-[calc(100vh-16rem)] flex flex-col">
            <h3 className="mb-3 font-bold text-slate-950 dark:text-white px-1">All open roles</h3>
            <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
              {matches.map((match) => (
                <li key={match.job_id}>
                  <button
                    type="button"
                    onClick={() => selectJob(match.job_id)}
                    disabled={detailLoading}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-left transition duration-200 outline-none',
                      selected.job_id === match.job_id
                        ? 'border-transparent bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-600/20 dark:to-indigo-600/20 ring-1 ring-violet-500/20'
                        : 'border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300',
                    ].join(' ')}
                  >
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">{match.job_title}</p>
                    <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1">{match.ats_score}% · {match.suitability}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold text-slate-950 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function AnalysisBlock({
  title,
  type,
  children,
}: {
  title: string;
  type: 'success' | 'warning' | 'neutral';
  children: ReactNode;
}) {
  const border = type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' : type === 'warning' ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30';
  return (
    <div className={`rounded-3xl border ${border} p-5 backdrop-blur-sm`}>
      <h4 className="mb-3 font-bold text-slate-900 dark:text-white">{title}</h4>
      {children}
    </div>
  );
}
