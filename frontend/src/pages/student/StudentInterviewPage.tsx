import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, MicrophoneIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

import {
  createInterviewSession,
  evaluateInterviewSession,
  fetchInterviewSessions,
  fetchInterviewSession,
  fetchInterviewTracks,
  sendInterviewMessage,
  type InterviewSessionDetail,
  type InterviewSessionSummary,
  type InterviewTrackOption,
} from '../../api/studentModules';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-2.5 w-2.5 rounded-full bg-cyan-300"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function StudentInterviewPage() {
  const [tracks, setTracks] = useState<InterviewTrackOption[]>([]);
  const [sessions, setSessions] = useState<InterviewSessionSummary[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('frontend');
  const [roleTitle, setRoleTitle] = useState('Frontend Engineer');
  const [experience, setExperience] = useState(2);
  const [session, setSession] = useState<InterviewSessionDetail | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [thinking, setThinking] = useState(false);

  const selectedQuestion = useMemo(() => session?.questions[session.messages.length / 2 | 0] ?? session?.questions[0], [session]);

  useEffect(() => {
    Promise.all([fetchInterviewTracks(), fetchInterviewSessions()])
      .then(([trackData, sessionData]) => {
        setTracks(trackData);
        setSessions(sessionData);
      })
      .catch(() => setError('Could not load interview workspace.'))
      .finally(() => setLoading(false));
  }, []);

  const startSession = async () => {
    setSending(true);
    setError('');
    try {
      const created = await createInterviewSession({
        role_track: selectedTrack as InterviewSessionDetail['role_track'],
        role_title: roleTitle,
        years_of_experience: experience,
        use_voice: false,
        context_note: `Candidate preparing for ${roleTitle}.`,
      });
      setSession(created);
      setSessions((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setDraft('');
    } catch {
      setError('Could not start interview session.');
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!session || !draft.trim()) {
      return;
    }
    setThinking(true);
    setSending(true);
    try {
      const updated = await sendInterviewMessage(session.id, { message: draft, voice_transcript: null });
      setSession(updated);
      setDraft('');
      setTimeout(async () => {
        const evaluated = await evaluateInterviewSession(session.id);
        setSession(evaluated);
        setThinking(false);
      }, 500);
    } catch {
      setError('Could not send response.');
      setThinking(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Mock Interviews"
        description="Practice technical and behavioral interviews with role-specific questions, feedback, and score cards."
      />
      <StatusMessage type="error" message={error} />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role track</p>
            <select className="glass-select mt-2" value={selectedTrack} onChange={(event) => setSelectedTrack(event.target.value)}>
              {tracks.map((track) => (
                <option key={track.value} value={track.value}>
                  {track.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target role</p>
            <input className="glass-input mt-2" value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Experience</p>
            <input className="glass-input mt-2" type="number" min={0} max={30} value={experience} onChange={(event) => setExperience(Number(event.target.value))} />
          </div>
          <button type="button" onClick={startSession} disabled={sending} className="glass-btn-primary w-full">
            {session ? 'Restart session' : 'Start interview'}
          </button>

          <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent sessions</p>
            <div className="mt-3 space-y-2">
              {sessions.slice(0, 5).map((item) => (
                <button key={item.id} onClick={async () => setSession(await fetchInterviewSession(item.id))} className="w-full rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-left text-sm font-medium text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.role_title || item.role_track}</span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-300">{item.status}</span>
                  </div>
                </button>
              ))}
              {sessions.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No sessions yet.</p> : null}
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden p-0">
          <div className="border-b border-slate-200/80 bg-slate-950/95 px-6 py-4 text-white dark:border-slate-800/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Interview room</p>
                <h3 className="mt-2 text-2xl font-semibold">{session?.role_title || 'Ready to begin'}</h3>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {thinking ? <ThinkingDots /> : 'Live'}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current question</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {selectedQuestion?.question || 'Start a session to receive questions.'}
                </p>
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                <AnimatePresence initial={false}>
                  {(session?.messages || []).map((message, index) => (
                    <motion.div
                      key={`${message.speaker}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={[
                        'max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6',
                        message.speaker === 'assistant'
                          ? 'ml-auto bg-slate-950 text-white shadow-lg'
                          : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800',
                      ].join(' ')}
                    >
                      {message.message}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {thinking ? (
                  <div className="max-w-[85%] rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-700 dark:text-cyan-200">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="h-5 w-5" />
                      <span>The assistant is thinking</span>
                      <ThinkingDots />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your answer or follow-up question..."
                  className="glass-input min-h-28 flex-1 resize-none"
                />
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={sendMessage} disabled={sending || !session} className="glass-btn-primary inline-flex items-center gap-2">
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Send
                  </button>
                  <button type="button" onClick={() => void startSession()} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    <MicrophoneIcon className="mr-2 inline h-4 w-4" />
                    Voice optional
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scores</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    ['Confidence', session?.evaluation?.confidence_score ?? session?.confidence_score ?? 0],
                    ['Communication', session?.evaluation?.communication_score ?? session?.communication_score ?? 0],
                    ['Technical', session?.evaluation?.technical_score ?? session?.technical_score ?? 0],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-4 dark:border-slate-800/70 dark:bg-slate-900/50">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{label as string}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value as number}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Feedback</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <p>{session?.evaluation?.summary || 'Complete the session to see an evaluation summary.'}</p>
                  {session?.evaluation ? (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Strengths</p>
                        <ul className="mt-2 space-y-1">
                          {session.evaluation.strengths.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Improvements</p>
                        <ul className="mt-2 space-y-1">
                          {session.evaluation.improvements.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}