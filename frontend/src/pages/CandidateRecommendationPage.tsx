import { useEffect, useState } from 'react';

import {
  CandidateRecommendation,
  JobListItem,
  fetchCandidateRecommendations,
  fetchJobs,
} from '../api/ats';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';

export function CandidateRecommendationPage() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<CandidateRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      })
      .catch(() => setError('Could not load jobs. Upload a job description first.'));
  }, []);

  const runMatch = async () => {
    if (!selectedJobId) {
      setError('Select a job first.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    setResults([]);
    try {
      const data = await fetchCandidateRecommendations(selectedJobId, topK);
      setResults(data);
      if (data.length === 0) {
        setInfo('No matches found. Upload resumes and ensure they are indexed.');
      }
    } catch {
      setError('Recommendation failed. Check that the job has embeddings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Candidate Recommendations"
        description="Find the best-matching resumes for a selected job using vector similarity."
      />

      <div className="glass-panel p-6 rounded-3xl shadow-sm">
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job description</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="glass-select mt-1.5"
              disabled={jobs.length === 0}
            >
              {jobs.length === 0 ? <option value="">No jobs available</option> : null}
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.filename}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Results limit</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="glass-select mt-1.5"
            >
              {[3, 5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  Top {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={runMatch}
          disabled={loading || !selectedJobId}
          className="mt-6 glass-btn-primary"
        >
          {loading ? 'Matching...' : 'Find matching candidates'}
        </button>
      </div>

      <StatusMessage type="error" message={error} />
      <StatusMessage type="info" message={info} />

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Resume ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Match score</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Summary</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={row.candidate_id} className="border-b border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-all duration-200">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{index + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{row.candidate_id}</td>
                  <td className="px-6 py-4 font-bold text-violet-600 dark:text-violet-400">{(row.match_score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{row.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
