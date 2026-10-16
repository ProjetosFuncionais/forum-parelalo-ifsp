import React from 'react';

const TOKEN = /(https?:\/\/[^\s]+|#[\p{L}\p{N}_]+)/gu;

/** Texto com #hashtags e links clicáveis. */
export const RichText: React.FC<{
  text: string;
  onTag?: (tag: string) => void;
  className?: string;
}> = ({ text, onTag, className }) => {
  const parts = text.split(TOKEN);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <React.Fragment key={i}>{part}</React.Fragment>;

        if (part.startsWith('#')) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTag?.(part.slice(1))}
              className="text-accent-ink font-medium hover:underline underline-offset-2"
            >
              {part}
            </button>
          );
        }

        // Remove pontuação final que não faz parte da URL.
        const match = part.match(/^(.*?)([.,;:!?)]*)$/);
        const url = match ? match[1] : part;
        const trailing = match ? match[2] : '';
        return (
          <React.Fragment key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-2 decoration-accent/40 hover:decoration-accent break-all"
            >
              {url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
            {trailing}
          </React.Fragment>
        );
      })}
    </p>
  );
};
