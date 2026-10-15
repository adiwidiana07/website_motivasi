import { useEffect, useState } from "react";
import { usePageTitle } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

const SIT_SECONDS = 20;

type Stage = "input" | "sit" | "release";

export default function OneThoughtPage() {
  const { copy } = useI18n();
  usePageTitle(copy.oneThought.title);

  const [stage, setStage] = useState<Stage>("input");
  const [draft, setDraft] = useState("");
  const [thought, setThought] = useState("");
  const [remaining, setRemaining] = useState(SIT_SECONDS);

  useEffect(() => {
    if (stage !== "sit") return;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === "sit" && remaining === 0) setStage("release");
  }, [stage, remaining]);

  function submit() {
    const value = draft.trim();
    if (!value) return;
    setThought(value);
    setRemaining(SIT_SECONDS);
    setStage("sit");
  }

  function again() {
    setDraft("");
    setThought("");
    setRemaining(SIT_SECONDS);
    setStage("input");
  }

  const progress = (remaining / SIT_SECONDS) * 100;

  return (
    <div className="shell flex min-h-[70vh] max-w-2xl flex-col justify-center pt-16 pb-24 sm:pt-20">
      <p className="label label-accent">{copy.oneThought.eyebrow}</p>

      {stage === "input" && (
        <div className="reveal">
          <h1 className="font-display display-hero mt-6 text-4xl font-medium sm:text-5xl">
            {copy.oneThought.title}
          </h1>
          <p className="mt-5 max-w-md text-muted">{copy.oneThought.prompt}</p>

          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder={copy.oneThought.placeholder}
            className="input mt-8 font-display text-lg"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="btn btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.oneThought.submit}
          </button>
        </div>
      )}

      {stage === "sit" && (
        <div className="reveal">
          <p className="label">{copy.oneThought.sitting}</p>
          <blockquote className="mt-8 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-snug">
            “{thought}”
          </blockquote>

          <div className="mt-12 flex items-center gap-5">
            <div className="h-px flex-1 bg-hairline" aria-hidden="true">
              <div
                className="h-px bg-accent transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-display text-2xl tabular-nums">{remaining}</span>
            <span className="label">{copy.oneThought.secondsLabel}</span>
          </div>
        </div>
      )}

      {stage === "release" && (
        <div className="reveal">
          <blockquote className="font-display text-[clamp(1.5rem,3.6vw,2.25rem)] leading-snug text-muted">
            “{thought}”
          </blockquote>
          <p className="mt-6 max-w-md text-muted">{copy.oneThought.release}</p>
          <button type="button" onClick={again} className="btn btn-ghost mt-8">
            {copy.oneThought.again}
          </button>
        </div>
      )}
    </div>
  );
}
