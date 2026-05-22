import { useEffect, useState } from 'react';

import {
  JobRecommendation,
  ResumeListItem,
  fetchJobRecommendations,
  fetchResumes,
} from '../api/ats';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';

export function JobRecommendationPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    fetchResumes()
      .then((data) => {
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      })
      .catch(() => setError('Could not load resumes. Upload a resume first.'));
  }, []);

  const runMatch = async () => {
    if (!selectedResumeId) {
      setError('Select a resume first.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    setResults([]);
    try {
      const data = await fetchJobRecommendations(selectedResumeId, topK);
      setResults(data);
      if (data.length === 0) {
        setInfo('No job matches found. Upload job descriptions first.');
      }
    } catch {
      setError('Recommendation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Job Recommendations"
        description="Find the best-matching jobs for a selected resume."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Resume</span>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="glass-select mt-1"
              disabled={resumes.length === 0}
            >
              {resumes.length === 0 ? <option value="">No resumes available</option> : null}
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.name || resume.filename} ({resume.filename})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Results</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="glass-select mt-1"
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
          disabled={loading || !selectedResumeId}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Matching...' : 'Find matching jobs'}
        </button>
      </div>

      <StatusMessage type="error" message={error} />
      <StatusMessage type="info" message={info} />

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Match score</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={row.job_id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.job_id}</td>
                  <td className="px-4 py-3 font-semibold text-sky-700">{(row.match_score * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-600">{row.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
