import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { PlayIcon, TrophyIcon } from '@heroicons/react/24/outline';

import {
  fetchCodingChallenges,
  fetchCodingLeaderboard,
  fetchCodingSubmissions,
  runCodingSubmission,
  type CodingChallenge,
  type CodingLeaderboardEntry,
  type CodingSubmission,
} from '../../api/studentModules';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';

const LANGUAGE_OPTIONS: Array<CodingChallenge['languages'][number]> = ['python', 'javascript', 'typescript', 'java', 'cpp', 'sql'];

export default function StudentCodingPage() {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [language, setLanguage] = useState<CodingSubmission['language']>('python');
  const [sourceCode, setSourceCode] = useState('// Select a challenge to load starter code');
  const [output, setOutput] = useState('Run code to see output.');
  const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);
  const [leaderboard, setLeaderboard] = useState<CodingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const selectedChallenge = useMemo(() => challenges.find((challenge) => challenge.id === selectedChallengeId) ?? challenges[0], [challenges, selectedChallengeId]);

  useEffect(() => {
    Promise.all([fetchCodingChallenges(), fetchCodingSubmissions(), fetchCodingLeaderboard()])
      .then(([challengeData, submissionData, leaderboardData]) => {
        setChallenges(challengeData);
        setSubmissions(submissionData);
        setLeaderboard(leaderboardData);
        if (challengeData.length > 0) {
          setSelectedChallengeId(challengeData[0].id);
          setLanguage(challengeData[0].languages[0] ?? 'python');
          setSourceCode(challengeData[0].starter_code);
        }
      })
      .catch(() => setError('Could not load coding challenges.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      setSourceCode(selectedChallenge.starter_code);
      setLanguage((selectedChallenge.languages[0] ?? 'python') as CodingSubmission['language']);
    }
  }, [selectedChallenge]);

  const handleRun = async () => {
    if (!selectedChallenge) {
      return;
    }
    setRunning(true);
    setError('');
    try {
      const submission = await runCodingSubmission({
        challenge_id: selectedChallenge.id,
        language,
        source_code: sourceCode,
      });
      setOutput([`Verdict: ${submission.verdict}`, `Score: ${submission.score}`, `Passed tests: ${submission.passed_tests}/${submission.total_tests}`, submission.stdout ? `Output:\n${submission.stdout}` : '', submission.stderr ? `Errors:\n${submission.stderr}` : '']
        .filter(Boolean)
        .join('\n\n'));
      setSubmissions((current) => [submission, ...current]);
      setLeaderboard(await fetchCodingLeaderboard());
    } catch (err) {
      setOutput('Execution failed. Configure PISTON_API_URL and run a Piston instance to enable live runs.');
      setError(err instanceof Error ? err.message : 'Could not run solution.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Coding Practice"
        description="Solve category-based challenges in a split workspace with live execution and a progress leaderboard."
      />
      <StatusMessage type="error" message={error} />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr_280px]">
        <div className="glass-card p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Challenges</p>
          {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p> : null}
          {challenges.map((challenge) => (
            <button key={challenge.id} onClick={() => setSelectedChallengeId(challenge.id)} className={['w-full rounded-2xl border px-4 py-3 text-left transition', selectedChallenge?.id === challenge.id ? 'border-cyan-400/30 bg-cyan-500/10' : 'border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/60'].join(' ')}>
              <p className="font-semibold text-slate-950 dark:text-white">{challenge.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{challenge.category} · {challenge.difficulty}</p>
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden p-0">
          <div className="border-b border-slate-200/80 bg-slate-950 px-5 py-4 text-white dark:border-slate-800/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Split editor</p>
                <h3 className="mt-1 text-2xl font-semibold">{selectedChallenge?.title || 'Choose a challenge'}</h3>
              </div>
              <button type="button" onClick={handleRun} disabled={running || !selectedChallenge} className="glass-btn-primary inline-flex items-center gap-2">
                <PlayIcon className="h-4 w-4" />
                {running ? 'Running...' : 'Run code'}
              </button>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-slate-200/80 lg:border-b-0 lg:border-r lg:border-slate-200/80 dark:border-slate-800/80">
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Problem statement</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{selectedChallenge?.description || 'Select a challenge to begin.'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Language</p>
                  <select className="glass-select mt-2" value={language} onChange={(event) => setLanguage(event.target.value as CodingSubmission['language'])}>
                    {(selectedChallenge?.languages ?? LANGUAGE_OPTIONS).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="h-[520px] overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70">
                  <Editor
                    height="100%"
                    language={language === 'typescript' ? 'typescript' : language === 'javascript' ? 'javascript' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'sql' ? 'sql' : 'python'}
                    value={sourceCode}
                    onChange={(value) => setSourceCode(value || '')}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-950/95 p-4 text-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/80">Output console</p>
                <pre className="mt-3 min-h-40 whitespace-pre-wrap text-sm leading-6 text-slate-200">{output}</pre>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent submissions</p>
                <div className="mt-3 space-y-2">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm dark:border-slate-800/70 dark:bg-slate-900/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-950 dark:text-white">{submission.challenge_title}</span>
                        <span className="text-xs text-cyan-600 dark:text-cyan-300">{submission.score}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{submission.passed_tests}/{submission.total_tests} tests · {submission.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Leaderboard</p>
          {leaderboard.map((entry, index) => (
            <div key={entry.user_id} className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">#{index + 1} {entry.full_name || entry.email || entry.user_id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{entry.submissions} submissions</p>
                </div>
                <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-300">
                  <TrophyIcon className="h-4 w-4" />
                  <span className="font-semibold">{entry.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}