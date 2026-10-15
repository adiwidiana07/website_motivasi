import { useState } from "react";
import { ArrowRight } from "../components/icons";
import { usePageTitle } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

export default function GentleChoicePage() {
  const { copy } = useI18n();
  usePageTitle(copy.gentleChoice.title);

  const [choice, setChoice] = useState<number | null>(null);
  const options = copy.gentleChoice.options;
  const chosen = choice === null ? null : options[choice];

  return (
    <div className="shell flex min-h-[70vh] max-w-2xl flex-col justify-center pt-16 pb-24 sm:pt-20">
      <p className="label label-accent">{copy.gentleChoice.eyebrow}</p>

      {!chosen ? (
        <div className="reveal">
          <h1 className="font-display display-hero mt-6 text-4xl font-medium sm:text-5xl">
            {copy.gentleChoice.title}
          </h1>
          <p className="mt-5 max-w-md text-muted">{copy.gentleChoice.prompt}</p>

          <div className="mt-10 flex flex-col">
            {options.map((option, index) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setChoice(index)}
                className="group flex cursor-pointer items-baseline gap-5 border-t border-hairline py-5 text-left transition-colors duration-200 last:border-b hover:bg-paper-deep/70 sm:px-3"
              >
                <span className="label">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl sm:text-2xl">
                  {option.label}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-auto text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <ArrowRight />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="reveal">
          <p className="label">{chosen.label}</p>
          <blockquote className="mt-7 font-display text-[clamp(1.75rem,4.4vw,2.75rem)] leading-snug">
            “{chosen.response}”
          </blockquote>
          <p className="mt-7 text-muted">{copy.gentleChoice.closing}</p>
          <button
            type="button"
            onClick={() => setChoice(null)}
            className="btn btn-ghost mt-8"
          >
            {copy.gentleChoice.again}
          </button>
        </div>
      )}
    </div>
  );
}
