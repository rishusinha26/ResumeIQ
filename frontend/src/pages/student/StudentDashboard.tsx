import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, ChatBubbleLeftRightIcon, CodeBracketIcon, LightBulbIcon, MapIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

import { JobATSAnalysis, fetchJobMatches, fetchMyResume } from '../../api/student';
import DashboardCard from '../../components/DashboardCard';
import { PageHeader } from '../../components/PageHeader';
import { ScoreRing } from '../../components/ScoreRing';
import { StatusMessage } from '../../components/StatusMessage';

export default function StudentDashboard() {
  const [resume, setResume] = useState<Awaited<ReturnType<typeof fetchMyResume>>>(null);
  const [topMatch, setTopMatch] = useState<JobATSAnalysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const myResume = await fetchMyResume();
        setResume(myResume);
        if (myResume) {
          const matches = await fetchJobMatches();
          setTopMatch(matches.matches[0] ?? null);
        }
      } catch {
        setError('Could not load your dashboard.');
      }
    }
    load();
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description="Track your resume score, explore roles, and jump into practice modules without leaving the student portal."
      />
      <StatusMessage type="error" message={error} />

      {!resume ? (
        <div className="rounded-3xl border border-amber-200/50 bg-amber-500/5 dark:border-amber-900/30 dark:bg-amber-950/15 p-6 shadow-sm">
          <p className="font-semibold text-amber-900 dark:text-amber-400">Get started</p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-500 font-medium">
            Upload your resume first to see ATS scores and job suitability.
          </p>
          <Link
            to="/student/resume"
            className="glass-btn-primary mt-4 inline-block"
          >
            Upload resume →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Your resume</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{resume.filename}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{resume.skills.length} skills detected</p>
            <Link to="/student/resume" className="mt-4 inline-block text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 hover:underline">
              Update resume →
            </Link>
          </div>
          {topMatch ? (
            <div className="flex items-center gap-6 glass-card p-6">
              <ScoreRing score={topMatch.ats_score} />
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Best job match</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-tight">{topMatch.job_title}</p>
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1">{topMatch.suitability}</p>
                <Link to="/student/ats" className="mt-3 inline-block text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline uppercase tracking-wider">
                  View all matches →
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center text-center">
              No jobs posted yet. Check back after recruiters upload roles.
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Company DSA"
          description="Practice company-specific DSA questions with LeetCode links and curated problem sets."
          icon={<CodeBracketIcon className="h-7 w-7" />}
          to="/student/dsa"
        />
        <DashboardCard
          title="Aptitude Prep"
          description="Attempt timed quizzes and train against a large aptitude bank of 1,000+ questions per topic."
          icon={<AcademicCapIcon className="h-7 w-7" />}
          to="/student/aptitude"
        />
        <DashboardCard
          title="Career Assistant"
          description="Generate a roadmap, close skill gaps, and plan your next move."
          icon={<MapIcon className="h-7 w-7" />}
          to="/student/career"
        />
        <DashboardCard
          title="Interview Feedback"
          description="Review recent mock interview history and improvement areas."
          icon={<PresentationChartLineIcon className="h-7 w-7" />}
          to="/student/interviews"
        />
        <DashboardCard
          title="Learning Signals"
          description="Use progress-aware prompts to keep your preparation focused."
          icon={<LightBulbIcon className="h-7 w-7" />}
          to="/student/career"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/student/ats" label="Check ATS score" />
        <QuickLink to="/student/roles" label="Suggested job roles" />
        <QuickLink to="/student/dsa" label="Company DSA" />
        <QuickLink to="/student/resume" label="Manage resume" />
      </div>
    </section>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-sm hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:shadow-sm"
    >
      {label}
    </Link>
  );
}
