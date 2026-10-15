import { useEffect, useState } from "react";
import { usePageTitle, usePrefersReducedMotion } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

const STEP_MS = [4000, 3000, 5000] as const;
const IDLE_SCALE = 0.85;
const ACTIVE_SCALE = 1;

type Phase = "idle" | "running" | "paused";

export default function BreathePage() {
  const { copy } = useI18n();
  usePageTitle(copy.breathe.title);
  const reduced = usePrefersReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setTimeout(() => {
      const nextStep = (step + 1) % STEP_MS.length;
      if (nextStep === 0) setCycles((value) => value + 1);
      setStep(nextStep);
    }, STEP_MS[step]);
    return () => window.clearTimeout(timer);
  }, [phase, step]);

  const stepLabels = [copy.breathe.inhale, copy.breathe.hold, copy.breathe.exhale];
  const label = phase === "idle" ? copy.breathe.idle : stepLabels[step];
  const scale = phase === "idle" || step === 2 ? IDLE_SCALE : ACTIVE_SCALE;
  const duration = phase === "running" ? STEP_MS[step] : 600;

  function start() {
    setCycles(0);
    setStep(0);
    setPhase("running");
  }

  function reset() {
    setPhase("idle");
    setStep(0);
    setCycles(0);
  }

  return (
    <div className="shell flex min-h-[70vh] max-w-2xl flex-col items-center justify-center pt-16 pb-24 text-center sm:pt-20">
      <p className="label label-accent">{copy.breathe.eyebrow}</p>

      <h1 className="font-display display-hero mt-6 text-4xl font-medium sm:text-5xl">
        {copy.breathe.title}
      </h1>
      <p className="mt-4 max-w-sm text-sm text-muted sm:text-base">
        {copy.breathe.intro}
      </p>

      <div className="relative mt-14 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-hairline"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-ink/20 transition-transform ease-in-out"
          style={{
            transform: reduced ? undefined : `scale(${scale})`,
            transitionDuration: `${duration}ms`,
          }}
        />
        <span className="font-display text-2xl sm:text-3xl">{label}</span>
      </div>

      <p className="label mt-9">
        {cycles} {cycles === 1 ? copy.breathe.cycle : copy.breathe.cycles}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {phase === "idle" && (
          <button type="button" onClick={start} className="btn btn-primary">
            {copy.breathe.start}
          </button>
        )}
        {phase === "running" && (
          <>
            <button
              type="button"
              onClick={() => setPhase("paused")}
              className="btn btn-ghost"
            >
              {copy.breathe.pause}
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost">
              {copy.breathe.restart}
            </button>
          </>
        )}
        {phase === "paused" && (
          <>
            <button
              type="button"
              onClick={() => setPhase("running")}
              className="btn btn-primary"
            >
              {copy.breathe.resume}
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost">
              {copy.breathe.restart}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
