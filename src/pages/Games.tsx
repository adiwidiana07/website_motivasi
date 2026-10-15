import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { ArrowRight } from "../components/icons";
import { usePageTitle } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

export default function GamesPage() {
  const { copy } = useI18n();
  usePageTitle(copy.games.eyebrow);

  return (
    <div className="shell max-w-4xl pt-14 pb-24 sm:pt-20">
      <Reveal>
        <p className="label label-accent">{copy.games.eyebrow}</p>
        <h1 className="font-display display-hero mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-tight font-medium">
          {copy.games.title}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
          {copy.games.intro}
        </p>
      </Reveal>

      <div className="mt-14">
        {copy.games.items.map((item, index) => (
          <Link
            key={item.number}
            to={item.href}
            className="reveal group grid grid-cols-[auto_1fr] gap-5 border-t border-hairline py-9 transition-colors duration-200 last:border-b hover:bg-paper-deep/70 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-10 sm:px-3"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="label pt-1 sm:pt-0">{item.number}</span>

            <span>
              <span className="label mb-2 block text-faint">{item.category}</span>
              <span className="block font-display text-3xl sm:text-4xl">
                {item.title}
              </span>
              <span className="mt-3 block max-w-lg text-sm leading-relaxed text-muted">
                {item.description}
              </span>
            </span>

            <span className="arrow-link col-start-2 mt-1 sm:col-start-3 sm:mt-0">
              {copy.games.begin}
              <ArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
