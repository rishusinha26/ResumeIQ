import { useCallback, useEffect, useState } from 'react';

import { JobListItem, fetchJobs, uploadJob } from '../api/ats';
import { FileUploadZone } from '../components/FileUploadZone';
import { PageHeader } from '../components/PageHeader';
import { SkillTags } from '../components/SkillTags';
import { StatusMessage } from '../components/StatusMessage';

export function JobUploadPage() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      setJobs(await fetchJobs());
    } catch {
      setError('Could not load jobs.');
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await uploadJob(file);
      setMessage(`Job "${result.filename}" uploaded with ${result.skills.length} skills extracted.`);
      await loadJobs();
    } catch {
      setError('Job upload failed. Use PDF, DOCX, or TXT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Job Description Upload"
        description="Upload job descriptions to extract requirements and enable candidate matching."
      />
      <FileUploadZone loading={loading} onFileSelected={handleUpload} />
      <StatusMessage type="success" message={message} />
      <StatusMessage type="error" message={error} />

      <div className="glass-panel p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Job postings ({jobs.length})</h3>
        {jobs.length === 0 ? (
          <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">No jobs uploaded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jobs.map((job) => (
              <li key={job.id} className="glass-card p-4 shadow-sm hover:border-violet-500/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900 dark:text-white">{job.filename}</p>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{new Date(job.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-4">
                  <SkillTags skills={job.skills} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
