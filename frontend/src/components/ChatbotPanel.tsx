import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';

import { sendChatMessage } from '../api/ats';
import { StatusMessage } from './StatusMessage';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotPanelProps {
  sessionKey: string;
  title: string;
  description: string;
  placeholder: string;
  emptyHints: string[];
  jobId?: string;
  jobSelector?: ReactNode;
}

export function ChatbotPanel({
  sessionKey,
  title,
  description,
  placeholder,
  emptyHints,
  jobId,
  jobSelector,
}: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const sid = (() => {
    const key = `chat_${sessionKey}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  })();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const data = await sendChatMessage(sid, text, jobId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : '';
      setError(detail || 'Chat failed. Check OPENAI_API_KEY in backend/.env and restart the server.');
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    sendMessage(text);
  };

  return (
    <section className="flex h-[calc(100vh-10rem)] flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 font-medium">{description}</p>
      </div>

      {jobSelector}

      {emptyHints.length > 0 && messages.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {emptyHints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => sendMessage(hint)}
              disabled={loading}
              className="rounded-full border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-all duration-200"
            >
              {hint}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={[
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-300',
                msg.role === 'user'
                  ? 'ml-auto bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-violet-500/10'
                  : 'bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/50 text-slate-800 dark:text-slate-200',
              ].join(' ')}
            >
              {msg.content}
            </div>
          ))}
          {loading ? (
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/50 rounded-2xl px-4 py-3 text-sm text-slate-500 mr-auto flex items-center gap-1.5 shadow-sm w-16">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200/80 dark:border-slate-800/80 p-4 bg-white/30 dark:bg-slate-950/20 backdrop-blur-md">
          <StatusMessage type="error" message={error} />
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="glass-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="glass-btn-primary px-6"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
