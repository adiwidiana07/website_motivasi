import { useEffect, useState } from "react";
import { fallbackQuotes, fetchPublishedQuotes, type Quote, type QuoteSource } from "./quotes";

/** True when the visitor prefers reduced motion (updates live). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onChange(event: MediaQueryListEvent) {
      setReduced(event.matches);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Stay Here` : "Stay Here — a quiet place";
  }, [title]);
}

/**
 * Loads published quotes once per mount. Renders the bundled seed immediately,
 * then swaps in Supabase data when it arrives. Falls back on errors so the
 * quiet never gets interrupted by a broken network.
 */
export function usePublishedQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(fallbackQuotes);
  const [source, setSource] = useState<QuoteSource>("fallback");

  useEffect(() => {
    let active = true;
    fetchPublishedQuotes()
      .then((result) => {
        if (!active) return;
        setQuotes(result.quotes);
        setSource(result.source);
      })
      .catch(() => {
        /* keep the fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  return { quotes, source };
}
