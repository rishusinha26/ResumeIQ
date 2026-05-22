import { useCallback, useEffect, useState } from 'react';

import { StudentResume, fetchMyResume, uploadMyResume } from '../../api/student';
import { FileUploadZone } from '../../components/FileUploadZone';
import { PageHeader } from '../../components/PageHeader';
import { SkillTags } from '../../components/SkillTags';
import { StatusMessage } from '../../components/StatusMessage';

export default function StudentResumePage() {
  const [resume, setResume] = useState<StudentResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadResume = useCallback(async () => {
    try {
      setResume(await fetchMyResume());
    } catch {
      setError('Could not load your resume.');
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await uploadMyResume(file);
      setMessage('Resume uploaded and parsed successfully.');
      await loadResume();
    } catch {
      setError('Upload failed. Use PDF or DOCX.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Resume"
        description="Upload your resume so recruiters can match you, and so you can see ATS scores for open roles."
      />
      <FileUploadZone loading={loading} onFileSelected={handleUpload} />
      <StatusMessage type="success" message={message} />
      <StatusMessage type="error" message={error} />

      {resume ? (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Current resume</h3>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{resume.filename}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {resume.name || 'Name not detected'} · {resume.email || 'Email not detected'}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Uploaded {new Date(resume.created_at).toLocaleString()}</p>
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Detected skills</p>
            <SkillTags skills={resume.skills} />
          </div>
        </div>
      ) : (
        <StatusMessage type="info" message="No resume on file yet. Upload one above to unlock ATS scoring." />
      )}
    </section>
  );
}
