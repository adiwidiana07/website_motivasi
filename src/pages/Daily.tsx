import { useEffect, useState } from "react";
import { usePageTitle, usePublishedQuotes } from "../lib/hooks";
import { useI18n } from "../lib/i18n";
import { localizedText } from "../lib/quotes";

const ROTATE_MS = 20_000;

export default function DailyPage() {
  const { copy, lang } = useI18n();
  const { quotes } = usePublishedQuotes();
  const [index, setIndex] = useState(0);
  const [sitting, setSitting] = useState(false);
  usePageTitle(copy.daily.eyebrow);

  const total = quotes.length;
  const current = total > 0 ? quotes[index % total] : null;

  useEffect(() => {
    if (sitting || total <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % total);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [sitting, total, index]);

  function next() {
    setIndex((value) => (value + 1) % total);
  }

  return (
    <div className="shell flex min-h-[70vh] max-w-3xl flex-col justify-center pt-16 pb-24 sm:pt-24">
      <p className="label label-accent">{copy.daily.eyebrow}</p>

      {current ? (
        <>
          <blockquote
            key={index}
            className="reveal mt-8 font-display text-[clamp(1.6rem,4.4vw,2.75rem)] leading-snug font-normal text-ink"
          >
            “{localizedText(current, lang)}”
          </blockquote>

          {/* Rotation progress */}
          <div className="mt-10 h-px w-full bg-hairline" aria-hidden="true">
            {!sitting && (
              <span
                key={index}
                className="block h-px origin-left animate-sweep bg-accent"
              />
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {!sitting ? (
              <button
                type="button"
                onClick={() => setSitting(true)}
                className="btn btn-ghost"
              >
                {copy.daily.sit}
              </button>
            ) : (
              <p className="label">{copy.daily.sitting}</p>
            )}
            <button type="button" onClick={next} className="btn btn-primary">
              {copy.daily.another}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-8 font-display text-2xl text-muted">{copy.daily.empty}</p>
      )}
    </div>
  );
}
