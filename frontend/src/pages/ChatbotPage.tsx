import { useEffect, useState } from 'react';

import { fetchJobs } from '../api/ats';
import { fetchStudentJobs } from '../api/student';
import { ChatbotPanel } from '../components/ChatbotPanel';
import { useAuth } from '../context/AuthContext';

export function ChatbotPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'candidate';

  if (isStudent) {
    return <StudentChatbot />;
  }
  return <RecruiterChatbot />;
}

function StudentChatbot() {
  const [jobs, setJobs] = useState<{ id: string; filename: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    fetchStudentJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedJobId(data[0].id);
      })
      .catch(() => setJobs([]));
  }, []);

  const jobSelector =
    jobs.length > 0 ? (
      <label className="block max-w-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 p-4 backdrop-blur-sm">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Target job (optional)</span>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="glass-select mt-2"
        >
          <option value="">General resume advice</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.filename}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  return (
    <ChatbotPanel
      sessionKey="student"
      title="Resume Coach"
    description="Get focused tips to improve your resume, add missing keywords, and strengthen your ATS score for open roles."
      placeholder="Ask how to improve your resume..."
      emptyHints={[
        'How can I improve my resume for ATS?',
        'What keywords am I missing for software roles?',
        'How do I increase my match score?',
        'What projects should I add to stand out?',
      ]}
      jobId={selectedJobId || undefined}
      jobSelector={jobSelector}
    />
  );
}

function RecruiterChatbot() {
  const [jobs, setJobs] = useState<{ id: string; filename: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedJobId(data[0].id);
      })
      .catch(() => setJobs([]));
  }, []);

  const jobSelector = (
    <label className="block max-w-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 p-4 backdrop-blur-sm">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Job to match candidates against</span>
      <select
        value={selectedJobId}
        onChange={(e) => setSelectedJobId(e.target.value)}
        className="glass-select mt-2"
        disabled={jobs.length === 0}
      >
        {jobs.length === 0 ? (
          <option value="">Upload a job first</option>
        ) : (
          jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.filename}
            </option>
          ))
        )}
      </select>
      {jobs.length === 0 ? (
        <p className="mt-2 text-xs text-amber-700">Upload job descriptions under Upload Jobs first.</p>
      ) : null}
    </label>
  );

  return (
    <ChatbotPanel
      sessionKey="recruiter"
      title="Hiring Assistant"
      description="Find students with the best match for a job. The system ranks candidates by fit score and explains who to interview."
      placeholder="Ask who fits this job best..."
      emptyHints={[
        'Who are the top 3 students for this job?',
        'Which candidate has the highest match score?',
        'Who should I interview first and why?',
        'Compare the best matches for this role',
      ]}
      jobId={selectedJobId || undefined}
      jobSelector={jobSelector}
    />
  );
}
