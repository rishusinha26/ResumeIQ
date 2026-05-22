interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const styles = {
  success: 'border-emerald-200/50 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400',
  error: 'border-red-200/50 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 text-red-800 dark:text-red-400',
  info: 'border-violet-200/50 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/20 text-violet-800 dark:text-violet-400',
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  if (!message) {
    return null;
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{message}</div>;
}
