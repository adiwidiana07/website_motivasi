import type { Lang } from "./i18n";
import { supabase } from "./supabase";
import { seedQuotes } from "../data/quotes.seed.js";

export type Quote = {
  id: string;
  text_en: string;
  text_id: string | null;
  author: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type QuoteInput = {
  text_en: string;
  text_id: string | null;
  tags: string[];
  published: boolean;
};

export type QuoteSource = "supabase" | "fallback";

export const fallbackQuotes: Quote[] = seedQuotes.map((quote, index) => ({
  id: `seed-${String(index + 1).padStart(3, "0")}`,
  text_en: quote.en,
  text_id: quote.id,
  author: null,
  tags: quote.tags,
  published: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
}));

const COLUMNS = "id, text_en, text_id, author, tags, published, created_at, updated_at";

export async function fetchPublishedQuotes(): Promise<{
  quotes: Quote[];
  source: QuoteSource;
}> {
  if (!supabase) {
    return { quotes: fallbackQuotes, source: "fallback" };
  }

  const { data, error } = await supabase
    .from("quotes")
    .select(COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Could not load quotes from Supabase — using bundled fallback.", error);
    return { quotes: fallbackQuotes, source: "fallback" };
  }

  return { quotes: (data ?? []) as Quote[], source: "supabase" };
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("quotes")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Quote[];
}

export async function createQuote(input: QuoteInput): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("quotes").insert(normalize(input));
  if (error) throw error;
}

export async function updateQuote(id: string, input: QuoteInput): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("quotes").update(normalize(input)).eq("id", id);
  if (error) throw error;
}

export async function deleteQuote(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("quotes").delete().eq("id", id);
  if (error) throw error;
}

function normalize(input: QuoteInput): QuoteInput {
  return {
    text_en: input.text_en.trim(),
    text_id: input.text_id?.trim() ? input.text_id.trim() : null,
    tags: [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
    published: input.published,
  };
}

function requireClient() {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  return supabase;
}

/** Deterministic "quote of the day" — everyone sees the same quote all day. */
export function quoteOfTheDay(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null;
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return quotes[daysSinceEpoch % quotes.length];
}

export function localizedText(quote: Quote, lang: Lang): string {
  if (lang === "id" && quote.text_id?.trim()) return quote.text_id;
  return quote.text_en;
}

export function collectTags(quotes: Quote[]): string[] {
  return [...new Set(quotes.flatMap((quote) => quote.tags))].sort();
}
