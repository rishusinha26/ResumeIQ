import { useEffect, useMemo, useState } from 'react';

interface TypingRevealProps {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  pauseMs?: number;
}

export function TypingReveal({ phrases, className, typingSpeed = 38, pauseMs = 1300 }: TypingRevealProps) {
  const safePhrases = useMemo(() => phrases.filter(Boolean), [phrases]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (safePhrases.length === 0) {
      return undefined;
    }

    const currentPhrase = safePhrases[phraseIndex % safePhrases.length];
    const interval = window.setTimeout(() => {
      if (!deleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1));
          return;
        }
        window.setTimeout(() => setDeleting(true), pauseMs);
        return;
      }

      if (text.length > 0) {
        setText(currentPhrase.slice(0, text.length - 1));
        return;
      }

      setDeleting(false);
      setPhraseIndex((current) => (current + 1) % safePhrases.length);
    }, deleting ? typingSpeed / 1.45 : typingSpeed);

    return () => window.clearTimeout(interval);
  }, [deleting, pauseMs, phraseIndex, safePhrases, text, typingSpeed]);

  if (safePhrases.length === 0) {
    return null;
  }

  return (
    <span className={className}>
      {text}
      <span className="ml-1 inline-block h-5 w-[2px] translate-y-[2px] animate-pulse rounded-full bg-cyan-300" />
    </span>
  );
}
