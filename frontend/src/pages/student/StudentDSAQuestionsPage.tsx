import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { fetchDSACompanies, fetchDSAQuestions, type DSAQuestion } from '../../api/studentModules';

const TOPICS = ['arrays', 'strings', 'graphs', 'trees', 'heap', 'intervals', 'design'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export default function StudentDSAQuestionsPage() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompanies() {
      try {
        const companyList = await fetchDSACompanies();
        setCompanies(companyList.sort());
        setSelectedCompany(companyList[0] ?? '');
      } catch {
        setError('Could not load DSA company list.');
      }
    }
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError('');

    fetchDSAQuestions(selectedCompany, selectedTopic || undefined, selectedDifficulty || undefined)
      .then(setQuestions)
      .catch(() => setError('Could not load company DSA questions.'))
      .finally(() => setLoading(false));
  }, [selectedCompany, selectedTopic, selectedDifficulty]);

  const questionCount = useMemo(() => questions.length, [questions]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Company DSA Practice"
        description="Choose a top tech company and practice curated DSA problems with direct LeetCode links."
      />

      <StatusMessage type="error" message={error} />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="glass-card p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company</p>
            <select
              className="glass-select mt-2 w-full"
              value={selectedCompany}
              onChange={(event) => setSelectedCompany(event.target.value)}
            >
              {companies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">DSA topic</p>
            <select
              className="glass-select mt-2 w-full"
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value)}
            >
              <option value="">All topics</option>
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Difficulty</p>
            <select
              className="glass-select mt-2 w-full"
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
            >
              <option value="">All difficulties</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bank overview</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">This module presents company-focused DSA problems and links to LeetCode for deep practice.</p>
            <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Questions loaded: {questionCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Filter by topic and difficulty to drill into the right company practice set.</p>
          </div>
        </div>

        <div className="glass-card p-5 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Practice list</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{selectedCompany || 'Select a company'}</h2>
            </div>
            <p className="rounded-full border border-slate-200/70 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              {questionCount} questions
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50/80 p-6 text-center text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400">
              Loading questions…
            </div>
          ) : null}

          {!loading && questions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 text-center text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400">
              No questions available for this company and filters.
            </div>
          ) : null}

          <div className="space-y-4">
            {questions.map((question) => (
              <article key={question.id} className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{question.topic}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{question.title}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {question.difficulty}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{question.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {question.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={question.leetcode_url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                  >
                    View on LeetCode
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
