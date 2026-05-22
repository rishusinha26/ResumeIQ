import { useCallback, useEffect, useState } from 'react';

import { ResumeListItem, fetchResumes, uploadResume } from '../api/ats';
import { FileUploadZone } from '../components/FileUploadZone';
import { PageHeader } from '../components/PageHeader';
import { SkillTags } from '../components/SkillTags';
import { StatusMessage } from '../components/StatusMessage';

export function ResumeUploadPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastUpload, setLastUpload] = useState('');

  const loadResumes = useCallback(async () => {
    try {
      setResumes(await fetchResumes());
    } catch {
      setError('Could not load resume list.');
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await uploadResume(file);
      setLastUpload(result.filename);
      setMessage(`Uploaded "${result.filename}" successfully. Text extracted and indexed for matching.`);
      await loadResumes();
    } catch {
      setError('Upload failed. Ensure you are signed in and the file is PDF or DOCX.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Resume Upload"
        description="Upload candidate resumes. Files are parsed, skills extracted, and embeddings stored for AI matching."
      />
      <FileUploadZone loading={loading} onFileSelected={handleUpload} />
      <StatusMessage type="success" message={message} />
      <StatusMessage type="error" message={error} />
      {lastUpload ? <StatusMessage type="info" message={`Latest upload: ${lastUpload}`} /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Uploaded resumes ({resumes.length})</h3>
        {resumes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No resumes yet. Upload your first file above.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {resumes.map((resume) => (
              <li key={resume.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{resume.filename}</p>
                    <p className="text-sm text-slate-500">
                      {resume.name || 'Unknown candidate'} · {resume.email || 'No email'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(resume.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-3">
                  <SkillTags skills={resume.skills} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
