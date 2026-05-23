import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { buildAptitudeQuiz, fetchAptitudeResults, submitAptitudeQuiz, type AptitudeQuestion, type AptitudeQuizSession, type AptitudeQuizResult } from '../../api/studentModules';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';

const TOPICS = [
  { value: 'quantitative', label: 'Quantitative' },
  { value: 'logical', label: 'Logical reasoning' },
  { value: 'verbal', label: 'Verbal ability' },
] as const;

export default function StudentAptitudePage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]['value']>('quantitative');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quiz, setQuiz] = useState<AptitudeQuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<AptitudeQuizResult[]>([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState<AptitudeQuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    fetchAptitudeResults()
      .then(setResults)
      .catch(() => setError('Could not load aptitude history.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!quiz) return undefined;
    const started = Date.now();
    const interval = window.setInterval(() => setTimer(Math.max(0, Math.floor((Date.now() - started) / 1000))), 1000);
    return () => window.clearInterval(interval);
  }, [quiz]);

  const progress = useMemo(() => {
    if (!quiz?.questions.length) return 0;
    return Math.round((Object.keys(answers).length / quiz.questions.length) * 100);
  }, [answers, quiz]);

  const startQuiz = async () => {
    setRunning(true);
    setError('');
    try {
      const session = await buildAptitudeQuiz({ topic, difficulty, question_count: 10 });
      if (session.questions.length === 0) {
        setError('No questions are available for this topic and difficulty.');
        return;
      }
      setQuiz(session);
      setAnswers({});
      setScore(null);
      setReviewMode(false);
      setTimer(0);
    } catch {
      setError('Could not start quiz.');
    } finally {
      setRunning(false);
    }
  };

  const stopQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setScore(null);
    setReviewMode(false);
    setTimer(0);
    setError('');
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setRunning(true);
    setError('');
    try {
      const response = await submitAptitudeQuiz({
        topic,
        difficulty,
        question_ids: quiz.questions.map((question) => question.id),
        answers: quiz.questions.map((question) => ({ question_id: question.id, selected_option: answers[question.id] ?? -1 })),
        duration_seconds: timer,
      });
      setScore(response);
      setReviewMode(true);
      setResults((current) => [response, ...current]);
    } catch {
      setError('Could not submit quiz.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Aptitude Preparation"
        description="Use a large bank of aptitude questions—over 1,000 per topic—to sharpen your quantitative, logical, and verbal skills."
      />
      <StatusMessage type="error" message={error} />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr_280px]">
        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Topic</p>
            <select className="glass-select mt-2" value={topic} onChange={(event) => setTopic(event.target.value as typeof topic)}>
              {TOPICS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Difficulty</p>
            <select className="glass-select mt-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
              {['easy', 'medium', 'hard'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <button type="button" onClick={startQuiz} disabled={running} className="glass-btn-primary w-full">Start quiz</button>
          {quiz ? (
            <button type="button" onClick={stopQuiz} disabled={running} className="glass-btn-secondary w-full">Stop quiz</button>
          ) : null}
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timer</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{timer}s</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" animate={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
<div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Quiz zone</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{quiz ? `${quiz.questions.length} timed questions` : 'Start a new quiz'}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {quiz ? <button type="button" onClick={submitQuiz} disabled={running} className="glass-btn-primary">Submit quiz</button> : null}
                {score ? (
                  <button type="button" onClick={() => setReviewMode((current) => !current)} className="glass-btn-secondary text-sm">
                    {reviewMode ? 'Hide review' : 'Review answers'}
                  </button>
                ) : null}
              </div>
          </div>

          <div className="space-y-4">
            {(quiz?.questions || []).map((question, index) => (
              <div key={question.id} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question {index + 1}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{question.question}</p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === optionIndex;
                    const correct = question.correct_option === optionIndex;
                    const optionClasses = [
                      'rounded-2xl border px-4 py-3 text-left text-sm transition',
                      score
                        ? correct
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                          : selected
                          ? 'border-rose-400/40 bg-rose-500/10 text-rose-900 dark:text-rose-100'
                          : 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
                        : selected
                        ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100'
                        : 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300',
                    ].join(' ');
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                        className={optionClasses}
                        disabled={!!score}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {score && reviewMode ? (
                  <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-100 p-3 text-sm text-slate-700 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-200">
                    {answers[question.id] == null || answers[question.id] === -1 ? (
                      <p>No answer selected. Correct answer: <span className="font-semibold">{question.options[question.correct_option]}</span>.</p>
                    ) : question.correct_option === answers[question.id] ? (
                      <p className="text-emerald-700 dark:text-emerald-200">Correct ✅ You selected <span className="font-semibold">{question.options[answers[question.id]]}</span>.</p>
                    ) : (
                      <p className="text-rose-700 dark:text-rose-200">Wrong ❌ You chose <span className="font-semibold">{question.options[answers[question.id]]}</span>. Correct answer: <span className="font-semibold">{question.options[question.correct_option]}</span>.</p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
            {!quiz ? <p className="text-sm text-slate-500 dark:text-slate-400">Use the controls on the left to generate a timed quiz.</p> : null}
          </div>

          {score ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-100">
              <p className="text-xs font-semibold uppercase tracking-wider">Latest result</p>
              <p className="mt-2 text-2xl font-semibold">{score.score}%</p>
              <p className="mt-1 text-sm">{score.correct_answers}/{score.total_questions} correct in {score.duration_seconds}s</p>
            </div>
          ) : null}
        </div>

        <div className="glass-card p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Score history</p>
          {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading history...</p> : null}
          {results.slice(0, 6).map((result) => (
            <div key={result.id} className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/60">
              <p className="text-sm font-semibold text-slate-950 dark:text-white capitalize">{result.topic} · {result.difficulty}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{result.score}% · {result.correct_answers}/{result.total_questions}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}