import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useI18n, type Lang } from "../lib/i18n";
import { usePlayer } from "./PlayerProvider";
import { PauseIcon, PlayIcon } from "./icons";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function LangToggle() {
  const { lang, setLang, copy } = useI18n();
  const options: Lang[] = ["en", "id"];

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={copy.common.language}
    >
      {options.map((option, index) => (
        <span key={option} className="flex items-center gap-2">
          {index > 0 && <span className="text-xs text-faint">/</span>}
          <button
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={option === lang}
            className={`cursor-pointer text-[11px] font-medium tracking-[0.2em] uppercase transition-colors duration-200 ${
              option === lang ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {option.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

function Nav() {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { to: "/", label: copy.nav.home, end: true },
    { to: "/daily", label: copy.nav.daily },
    { to: "/games", label: copy.nav.games },
    { to: "/music", label: copy.nav.music },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur">
      <div className="shell flex items-center justify-between py-4">
        <Link
          to="/"
          className="font-display text-lg tracking-tight text-ink"
          aria-label={copy.nav.home}
        >
          Stay Here<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
          <LangToggle />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? copy.common.close : copy.common.menu}
          className="relative -mr-2 cursor-pointer p-2 md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute top-1/2 left-0 h-px w-5 bg-ink transition-transform duration-200 ${
                open ? "rotate-45" : "-translate-y-[5px]"
              }`}
            />
            <span
              className={`absolute top-1/2 left-0 h-px w-5 bg-ink transition-transform duration-200 ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-hairline md:hidden">
          <nav className="shell flex flex-col gap-5 py-6" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active w-fit" : "nav-link w-fit"
                }
              >
                {link.label}
              </NavLink>
            ))}
            <LangToggle />
          </nav>
        </div>
      )}
    </header>
  );
}

function PlayerBar() {
  const { current, playing, toggle } = usePlayer();
  const { copy } = useI18n();

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 backdrop-blur">
      <div className="shell flex items-center justify-between gap-4 py-3">
        <p className="flex min-w-0 items-baseline gap-3">
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full ${
              playing ? "animate-pulse bg-accent" : "bg-faint"
            }`}
          />
          <span className="label shrink-0">
            {playing ? copy.music.nowPlaying : copy.music.pausedLabel}
          </span>
          <span className="truncate font-display text-sm">{current.title}</span>
        </p>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? copy.music.pause : copy.music.play}
          className="btn btn-ghost btn-small shrink-0"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          <span className="hidden sm:inline">
            {playing ? copy.music.pause : copy.music.play}
          </span>
        </button>
      </div>
    </div>
  );
}

function Footer() {
  const { copy } = useI18n();

  return (
    <footer className="border-t border-hairline">
      <div className="shell flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl">
            Stay Here<span className="text-accent">.</span>
          </p>
          <p className="mt-1 text-sm text-muted">{copy.footer.line}</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Footer">
            <Link to="/daily" className="text-muted transition-colors hover:text-ink">
              {copy.nav.daily}
            </Link>
            <Link to="/games" className="text-muted transition-colors hover:text-ink">
              {copy.nav.games}
            </Link>
            <Link to="/music" className="text-muted transition-colors hover:text-ink">
              {copy.nav.music}
            </Link>
          </nav>
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} Stay Here
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { current } = usePlayer();

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-50" />
      <ScrollToTop />

      <div className={`flex min-h-dvh flex-col ${current ? "pb-16" : ""}`}>
        <Nav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      <PlayerBar />
    </div>
  );
}
