import { useState } from 'react';

import { ResumeParseResult, parseResume } from '../api/ats';
import { FileUploadZone } from '../components/FileUploadZone';
import { PageHeader } from '../components/PageHeader';
import { SkillTags } from '../components/SkillTags';
import { StatusMessage } from '../components/StatusMessage';

export function ResumeParsingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResumeParseResult | null>(null);

  const handleParse = async (file: File) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await parseResume(file));
    } catch {
      setError('Parsing failed. Use PDF, DOCX, DOC, or TXT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Resume Parsing"
        description="Parse a resume without saving to preview extracted skills, education, and experience."
      />
      <FileUploadZone loading={loading} onFileSelected={handleParse} />
      <StatusMessage type="error" message={error} />

      {result ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Parsed: {result.filename}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Info label="Name" value={result.name} />
            <Info label="Email" value={result.email} />
            <Info label="Phone" value={result.phone} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Skills</p>
            <SkillTags skills={result.skills} />
          </div>
          <TextBlock title="Education" items={result.education} />
          <TextBlock title="Experience" items={result.experience} />
          <TextBlock title="Certifications" items={result.certifications} />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Raw text preview</p>
            <pre className="max-h-48 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {result.text.slice(0, 2000)}
              {result.text.length > 2000 ? '...' : ''}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}

function TextBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
