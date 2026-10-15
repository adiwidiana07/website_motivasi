import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { ArrowRight } from "../components/icons";
import { usePageTitle, usePublishedQuotes } from "../lib/hooks";
import { useI18n } from "../lib/i18n";
import { localizedText, quoteOfTheDay } from "../lib/quotes";

export default function HomePage() {
  const { copy, lang } = useI18n();
  const { quotes } = usePublishedQuotes();
  const quote = quoteOfTheDay(quotes);
  usePageTitle();

  const dateLabel = new Date().toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long" },
  );

  return (
    <div className="shell">
      {/* Hero */}
      <section className="grid gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <Reveal>
          <p className="label label-accent">{copy.home.eyebrow}</p>
          <h1 className="font-display display-hero mt-6 text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.04] font-medium tracking-tight">
            {copy.home.lead}
            <br />
            <em className="font-normal text-accent-deep">{copy.home.leadAccent}</em>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted">
            {copy.home.intro}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/daily" className="btn btn-primary">
              {copy.home.ctaDaily}
            </Link>
            <Link to="/games" className="btn btn-ghost">
              {copy.home.ctaGames}
            </Link>
          </div>
        </Reveal>

        {quote && (
          <Reveal delay={140}>
            <figure className="flex h-full flex-col justify-between border border-hairline bg-white/50 p-7 sm:p-8">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="label">{copy.home.todaysWord}</span>
                <span className="text-xs text-faint">{dateLabel}</span>
              </figcaption>

              <blockquote className="mt-8 font-display text-2xl leading-snug text-ink sm:text-[1.7rem]">
                “{localizedText(quote, lang)}”
              </blockquote>

              <div className="mt-9 flex items-center justify-between gap-4">
                <span aria-hidden="true" className="h-px w-12 bg-accent" />
                <Link to="/daily" className="arrow-link">
                  {copy.home.readDaily}
                  <ArrowRight />
                </Link>
              </div>
            </figure>
          </Reveal>
        )}
      </section>

      {/* Index */}
      <section className="pb-24">
        <Reveal>
          <div className="flex items-center gap-6">
            <h2 className="label shrink-0">{copy.home.indexTitle}</h2>
            <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
          </div>
        </Reveal>

        <div className="mt-4">
          {copy.home.index.map((item, index) => (
            <Link
              key={item.number}
              to={item.href}
              className="reveal group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-b border-hairline py-8 transition-colors duration-200 hover:bg-paper-deep/70 sm:gap-10 sm:px-3"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="label">{item.number}</span>
              <span>
                <span className="font-display text-2xl sm:text-3xl">
                  {item.title}
                </span>
                <span className="mt-1.5 block max-w-md text-sm leading-relaxed text-muted">
                  {item.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="self-center text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-deep"
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
