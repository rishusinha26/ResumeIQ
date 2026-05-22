import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CpuChipIcon,
  DocumentArrowUpIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import {
  type CandidateListItem,
  type CandidateRecommendation,
  type JobListItem,
  type ResumeListItem,
  fetchCandidateRecommendations,
  fetchCandidates,
  fetchJobs,
  fetchResumes,
} from '../api/ats';
import { ScoreRing } from '../components/ScoreRing';
import { SkillTags } from '../components/SkillTags';
import { FloatingParticlesBackground } from '../components/dashboard/FloatingParticlesBackground';
import { RecommendationVisualization } from '../components/dashboard/RecommendationVisualization';
import { TypingReveal } from '../components/dashboard/TypingReveal';
import { useAuth } from '../context/AuthContext';

const quickActions = [
  {
    to: '/jobs/upload',
    label: 'Upload job',
    description: 'Create a live matching target for candidate screening.',
    icon: DocumentArrowUpIcon,
  },
  {
    to: '/recommendations/candidates',
    label: 'Find candidates',
    description: 'Review ranked candidates for a role.',
    icon: ChartBarIcon,
  },
  {
    to: '/chatbot',
    label: 'Assistant',
    description: 'Ask follow-up questions about hiring signals.',
    icon: ChatBubbleLeftRightIcon,
  },
];

function StatTile({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function ScanStep({ label, complete, delay }: { label: string; complete: boolean; delay: number }) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <span className={complete ? 'text-cyan-100' : 'text-slate-400'}>{label}</span>
      <span
        className={[
          'h-2.5 w-2.5 rounded-full transition-all',
          complete ? 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]' : 'bg-slate-600',
        ].join(' ')}
      />
    </motion.div>
  );
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([fetchJobs(), fetchResumes(), fetchCandidates()])
      .then(([jobsData, resumesData, candidatesData]) => {
        if (!active) {
          return;
        }
        setJobs(jobsData);
        setResumes(resumesData);
        setCandidates(candidatesData);
        setSelectedJobId((current) => current || jobsData[0]?.id || '');
      })
      .catch(() => {
        if (active) {
          setError('Could not load dashboard data. Check the backend connection and try again.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setRecommendations([]);
      return undefined;
    }

    let active = true;
    fetchCandidateRecommendations(selectedJobId, 6)
      .then((data) => {
        if (active) {
          setRecommendations(data);
        }
      })
      .catch(() => {
        if (active) {
          setRecommendations([]);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedJobId]);

  const topSkills = useMemo(() => {
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
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }, [jobs, resumes]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const topScore = recommendations[0]?.match_score ?? 0;
  const averageScore = recommendations.length
    ? recommendations.reduce((sum, item) => sum + item.match_score, 0) / recommendations.length
    : 0;
  const scanProgress = Math.min(
    100,
    36 + resumes.length * 6 + jobs.length * 5 + recommendations.length * 4,
  );
  const recommendationSeries = recommendations.map((item, index) => ({
    name: `Top ${index + 1}`,
    score: Math.round(item.match_score),
  }));

  return (
    <motion.section
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-slate-100 shadow-[0_30px_100px_rgba(2,6,23,0.55)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <FloatingParticlesBackground />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.82)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_28%)]" />

      <div className="relative z-10 space-y-8 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">ATS command center</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome, {user?.full_name || user?.email || 'Recruiter'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              <TypingReveal
                className="font-medium text-cyan-100"
                phrases={[
                  'Scanning resumes in real time.',
                  'Ranking candidates by skill fit.',
                  'Highlighting missing keywords instantly.',
                  'Turning ATS data into hiring action.',
                ]}
              />
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
            Live analysis
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Live jobs"
            value={loading ? '—' : jobs.length}
            hint="Active roles being matched against resumes"
          />
          <StatTile
            label="Resumes parsed"
            value={loading ? '—' : resumes.length}
            hint="Uploaded documents available for analysis"
          />
          <StatTile
            label="Candidate profiles"
            value={loading ? '—' : candidates.length}
            hint="Profiles visible to recruiters and admin users"
          />
          <StatTile
            label="Top match score"
            value={loading ? '—' : `${Math.round(topScore)}%`}
            hint="Highest recommendation across the selected role"
          />
        </div>

        {error ? (
          <div className="rounded-[1.35rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.22)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.05 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Resume scanning</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Document parsing pipeline</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {selectedJob ? `Targeting ${selectedJob.filename}` : 'No role selected'}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Scan progress</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800/80">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 shadow-[0_0_22px_rgba(56,189,248,0.45)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Analysis status</p>
                      <p className="mt-1 text-sm text-white">
                        {selectedJob ? `Matching talent against ${selectedJob.filename}` : 'Waiting for a job to analyze'}
                      </p>
                    </div>
                    <CpuChipIcon className="h-7 w-7 text-cyan-300" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <ScanStep label="Extracting work history" complete={scanProgress > 40} delay={0.05} />
                    <ScanStep label="Checking keywords & skills" complete={scanProgress > 55} delay={0.12} />
                    <ScanStep label="Computing ATS fit score" complete={scanProgress > 72} delay={0.19} />
                    <ScanStep label="Preparing recruiter insights" complete={scanProgress > 85} delay={0.26} />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Selected role</p>
                    <p className="mt-1 text-sm text-white">{selectedJob ? selectedJob.filename : 'Choose a job'}</p>
                  </div>
                  <BriefcaseIcon className="h-6 w-6 text-cyan-300" />
                </div>

                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="glass-select mt-4"
                >
                  {jobs.length === 0 ? <option value="">No jobs available</option> : null}
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.filename}
                    </option>
                  ))}
                </select>

                <div className="mt-6 flex items-center justify-center">
                  <ScoreRing score={topScore} size={170} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Average fit</p>
                    <p className="mt-2 text-xl font-semibold text-white">{Math.round(averageScore)}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Peak fit</p>
                    <p className="mt-2 text-xl font-semibold text-white">{Math.round(topScore)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.22)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.1 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Recommendations</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Candidate intelligence</h3>
              </div>
              <ArrowTrendingUpIcon className="h-7 w-7 text-cyan-300" />
            </div>

            <div className="mt-6 space-y-4">
              {recommendations.length === 0 ? (
                <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-5 text-sm text-slate-400">
                  Select a job to generate candidate matches.
                </div>
              ) : (
                recommendations.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={`${item.candidate_id}-${index}`}
                    className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.32 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Candidate {index + 1}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                      </div>
                      <div className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                        {Math.round(item.match_score)}%
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(6, Math.min(100, item.match_score))}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Skill cloud</p>
              <div className="mt-4">
                <SkillTags skills={topSkills} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <RecommendationVisualization
            title="Ranking heat map"
            subtitle="Candidate scores plotted as a live fit curve with a fit breakdown on the side."
            data={recommendationSeries}
            emptyMessage="Pick a job to see live recommendation curves and fit breakdowns."
          />

          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.22)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.12 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">Execution path</p>
                <h3 className="mt-2 text-xl font-semibold text-white">What the AI is doing now</h3>
              </div>
              <UserGroupIcon className="h-7 w-7 text-cyan-300" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Scan summary</p>
                <p className="mt-3 text-sm text-slate-300">
                  {loading
                    ? 'Loading live ATS metrics...'
                    : `${resumes.length} resumes and ${jobs.length} jobs are being compared against ${candidates.length} profiles.`}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Chatbot mode</p>
                <p className="mt-3 text-sm text-slate-300">
                  Assistant is ready to explain ranking logic, missing keywords, and hiring decisions.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-900/70"
                  >
                    <Icon className="h-6 w-6 text-cyan-300 transition group-hover:scale-110" />
                    <p className="mt-4 text-sm font-semibold text-white">{action.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
