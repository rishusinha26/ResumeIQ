import { ChangeEvent, DragEvent, useRef, useState } from 'react';

interface FileUploadZoneProps {
  accept?: string;
  hint?: string;
  loading?: boolean;
  onFileSelected: (file: File) => void;
}

export function FileUploadZone({
  accept = '.pdf,.doc,.docx,.txt',
  hint = 'PDF, DOCX, DOC, or TXT',
  loading = false,
  onFileSelected,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (file) {
      onFileSelected(file);
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        'rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 outline-none',
        dragOver 
          ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 ring-4 ring-violet-500/10' 
          : 'border-slate-300 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30 hover:border-violet-500/50 hover:bg-white/50 dark:hover:bg-slate-900/30',
        loading ? 'pointer-events-none opacity-60' : 'cursor-pointer',
      ].join(' ')}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onInputChange} />
      
      {/* Upload Icon */}
      <div className={[
        'w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm transition-all duration-300',
        dragOver ? 'scale-110 text-violet-500 border-violet-500/20 bg-violet-50 dark:bg-violet-950/30' : ''
      ].join(' ')}>
        {loading ? (
          <svg className="w-7 h-7 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-7 h-7 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>

      <div>
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {loading ? 'Processing file...' : 'Drop a file here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{hint}</p>
      </div>
    </div>
  );
}
