import { PauseIcon, PlayIcon } from "../components/icons";
import { usePageTitle } from "../lib/hooks";
import { useI18n } from "../lib/i18n";
import { tracks } from "../lib/tracks";
import { usePlayer } from "../components/PlayerProvider";

export default function MusicPage() {
  const { copy } = useI18n();
  const { current, playing, select } = usePlayer();
  usePageTitle(copy.music.title);

  return (
    <div className="shell max-w-3xl pt-14 pb-24 sm:pt-20">
      <p className="label label-accent">{copy.music.eyebrow}</p>

      <h1 className="font-display display-hero mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] font-medium">
        {copy.music.title}
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        {copy.music.intro}
      </p>

      <ul className="mt-14">
        {tracks.map((track, index) => {
          const isCurrent = current?.id === track.id;
          const isPlaying = isCurrent && playing;

          return (
            <li key={track.id} className="border-t border-hairline last:border-b">
              <button
                type="button"
                onClick={() => select(track.id)}
                aria-pressed={isCurrent}
                aria-label={`${isPlaying ? copy.music.pause : copy.music.play} — ${track.title}`}
                className="group flex w-full cursor-pointer items-center gap-5 py-6 text-left transition-colors duration-200 hover:bg-paper-deep/70 sm:gap-8 sm:px-3"
              >
                <span className="label w-7">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate font-display text-xl sm:text-2xl ${
                      isCurrent ? "text-accent-deep" : "text-ink"
                    }`}
                  >
                    {track.title}
                  </span>
                  <span className="mt-1 block text-xs text-faint">
                    {isCurrent
                      ? playing
                        ? copy.music.nowPlaying
                        : copy.music.pausedLabel
                      : "\u00a0"}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                    isPlaying
                      ? "border-accent bg-accent/10 text-accent-deep"
                      : "border-hairline text-ink group-hover:border-ink"
                  }`}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
