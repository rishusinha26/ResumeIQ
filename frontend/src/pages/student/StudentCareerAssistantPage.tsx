import { useEffect, useState } from 'react';
import { LightBulbIcon, MapIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { fetchCareerSummary, generateCareerAnalysis, type CareerSummaryResponse } from '../../api/studentModules';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';

const PROMPTS = ['How to become ML Engineer?', 'What skills am I missing for SDE role?', 'Create a roadmap for backend developer'];

export default function StudentCareerAssistantPage() {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer');
  const [summary, setSummary] = useState<CareerSummaryResponse | null>(null);
  const [analysis, setAnalysis] = useState<CareerSummaryResponse['latest_analysis'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCareerSummary()
      .then((data) => {
        setSummary(data);
        setAnalysis(data.latest_analysis);
        if (data.latest_analysis?.target_role) {
          setTargetRole(data.latest_analysis.target_role);
        }
      })
      .catch(() => setError('Could not load career summary.'))
      .finally(() => setLoading(false));
  }, []);

  const runAnalysis = async () => {
    setRunning(true);
    setError('');
    try {
      const result = await generateCareerAnalysis({ prompt, target_role: targetRole, include_learning_path: true });
      setAnalysis(result.analysis);
      setSummary({ latest_analysis: result.analysis, latest_learning_path: result.learning_path });
    } catch {
      setError('Could not generate a career roadmap.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Career Assistant"
        description="Ask for a roadmap, surface skill gaps, and get interview preparation suggestions using your ATS profile."
      />
      <StatusMessage type="error" message={error} />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Example prompts</p>
          <div className="space-y-2">
            {PROMPTS.map((item) => (
              <button key={item} type="button" onClick={() => setPrompt(item)} className="w-full rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300">
                <SparklesIcon className="mr-2 inline h-4 w-4 text-cyan-500" />
                {item}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target role</p>
            <input className="glass-input mt-2" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ask the assistant</p>
            <textarea className="glass-input mt-2 min-h-36 resize-none" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </div>
          <button type="button" onClick={runAnalysis} disabled={running} className="glass-btn-primary w-full">Generate roadmap</button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Career planning</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{analysis?.target_role || targetRole}</h3>
              </div>
              <MapIcon className="h-8 w-8 text-cyan-500" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{analysis?.skill_gap_summary || 'Generate a roadmap to see skill gaps and learning steps.'}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Learning recommendations</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {(analysis?.learning_recommendations || []).map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interview preparation</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {(analysis?.interview_preparation || []).map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(analysis?.roadmap || summary?.latest_learning_path?.roadmap || []).map((step) => (
              <div key={step.title} className="glass-card p-5">
                <LightBulbIcon className="h-6 w-6 text-cyan-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{step.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">{step.timeframe_weeks} weeks</p>
              </div>
            ))}
          </div>

          {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading career assistant...</p> : null}
        </div>
      </div>
    </section>
  );
}