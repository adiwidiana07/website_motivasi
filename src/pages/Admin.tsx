import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { usePageTitle } from "../lib/hooks";
import {
  collectTags,
  createQuote,
  deleteQuote,
  fetchAllQuotes,
  updateQuote,
  type Quote,
  type QuoteInput,
} from "../lib/quotes";
import { supabase } from "../lib/supabase";

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

function errorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "Something unexpected happened.";

  if (/does not exist|relation .* not found/i.test(raw)) {
    return `${raw} — did you run supabase/schema.sql in the SQL Editor?`;
  }
  return raw;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Toast = { id: number; message: string; tone: "ok" | "error" };

/* -------------------------------------------------------------------------- */
/*  Page entry                                                                */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  usePageTitle("Admin");

  if (!supabase) return <SetupChecklist />;
  return <AdminGate client={supabase} />;
}

/* -------------------------------------------------------------------------- */
/*  Setup checklist (shown before Supabase is configured)                     */
/* -------------------------------------------------------------------------- */

function SetupChecklist() {
  return (
    <div className="shell max-w-2xl pt-14 pb-24 sm:pt-20">
      <p className="label label-accent">Admin</p>
      <h1 className="font-display display-hero mt-6 text-4xl font-medium sm:text-5xl">
        Connect Supabase first.
      </h1>
      <p className="mt-5 text-muted">
        Five quiet steps and the admin panel wakes up. The public site already
        works with the bundled quotes in the meantime.
      </p>

      <ol className="mt-10 flex list-none flex-col gap-6 text-sm leading-relaxed">
        <li className="flex gap-4">
          <span className="label pt-0.5">01</span>
          <span>
            Create a project at{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-hairline underline-offset-4 hover:decoration-ink"
            >
              supabase.com/dashboard
            </a>{" "}
            — pick a region close to you (Singapore works well from Indonesia).
          </span>
        </li>
        <li className="flex gap-4">
          <span className="label pt-0.5">02</span>
          <span>
            Copy <code className="bg-paper-deep px-1.5 py-0.5">.env.example</code>{" "}
            to <code className="bg-paper-deep px-1.5 py-0.5">.env.local</code>,
            then paste your Project URL and anon key from{" "}
            <em>Project Settings → API Keys</em>. Restart{" "}
            <code className="bg-paper-deep px-1.5 py-0.5">npm run dev</code>{" "}
            afterwards.
          </span>
        </li>
        <li className="flex gap-4">
          <span className="label pt-0.5">03</span>
          <span>
            Open the SQL Editor, paste the whole contents of{" "}
            <code className="bg-paper-deep px-1.5 py-0.5">supabase/schema.sql</code>{" "}
            and press Run. That creates the{" "}
            <code className="bg-paper-deep px-1.5 py-0.5">quotes</code> table,
            the security rules, and seeds all quotes (English + Indonesian).
          </span>
        </li>
        <li className="flex gap-4">
          <span className="label pt-0.5">04</span>
          <span>
            Go to <em>Authentication → Users → Add user</em> and create your
            admin account with an email and password. That is the login for
            this page.
          </span>
        </li>
        <li className="flex gap-4">
          <span className="label pt-0.5">05</span>
          <span>
            In <em>Authentication → Sign In / Providers</em>, turn off{" "}
            <em>Allow new users to sign up</em>. Only your account can write.
          </span>
        </li>
      </ol>

      <pre className="mt-10 overflow-x-auto border border-hairline bg-white/60 p-5 text-xs leading-relaxed text-ink-soft">
        {`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Auth gate                                                                 */
/* -------------------------------------------------------------------------- */

function AdminGate({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  if (!ready) {
    return (
      <div className="shell max-w-2xl pt-24 pb-24">
        <p className="label">Loading…</p>
      </div>
    );
  }

  return session ? (
    <Dashboard client={client} session={session} />
  ) : (
    <LoginScreen client={client} />
  );
}

function LoginScreen({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signInError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) setError(errorMessage(signInError));
    setBusy(false);
  }

  return (
    <div className="shell max-w-md pt-14 pb-24 sm:pt-20">
      <p className="label label-accent">Admin</p>
      <h1 className="font-display display-hero mt-6 text-4xl font-medium">
        Sign in.
      </h1>
      <p className="mt-4 text-sm text-muted">
        Only the account you created in Supabase Authentication can write here.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="label">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="label">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
          />
        </label>

        {error && (
          <p className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function Dashboard({
  client,
  session,
}: {
  client: SupabaseClient;
  session: Session;
}) {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all",
  );
  const [editing, setEditing] = useState<Quote | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setQuotes(await fetchAllQuotes());
    } catch (loadError) {
      setError(errorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function pushToast(message: string, tone: Toast["tone"] = "ok") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }

  const tags = useMemo(() => collectTags(quotes ?? []), [quotes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (quotes ?? []).filter((quote) => {
      if (statusFilter === "published" && !quote.published) return false;
      if (statusFilter === "draft" && quote.published) return false;
      if (tagFilter && !quote.tags.includes(tagFilter)) return false;
      if (
        term &&
        !`${quote.text_en} ${quote.text_id ?? ""}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [quotes, search, tagFilter, statusFilter]);

  const publishedCount = (quotes ?? []).filter((quote) => quote.published).length;

  async function handleSave(input: QuoteInput) {
    if (editing === "new") {
      await createQuote(input);
      pushToast("Quote created.");
    } else if (editing) {
      await updateQuote(editing.id, input);
      pushToast("Quote updated.");
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteQuote(id);
      pushToast("Quote deleted.");
      await load();
    } catch (deleteError) {
      pushToast(errorMessage(deleteError), "error");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="shell max-w-5xl pt-14 pb-24 sm:pt-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label label-accent">Admin</p>
          <h1 className="font-display display-hero mt-4 text-4xl font-medium">
            Quotes
          </h1>
          <p className="mt-2 text-sm text-muted">
            {quotes
              ? `${quotes.length} total · ${publishedCount} published · ${session.user.email}`
              : session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => client.auth.signOut()}
            className="btn btn-ghost btn-small"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="btn btn-primary btn-small"
          >
            New quote
          </button>
        </div>
      </div>

      <div className="rule mt-8" />

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search quotes…"
          className="input max-w-xs flex-1"
        />
        <select
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          className="input w-auto"
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as typeof statusFilter)
          }
          className="input w-auto"
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-6 border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent-deep">
          {error}
        </p>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto border border-hairline bg-white/50">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              <th className="label px-4 py-3 font-medium">Quote</th>
              <th className="label px-4 py-3 font-medium">Tags</th>
              <th className="label px-4 py-3 font-medium">Status</th>
              <th className="label px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {quotes === null && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            )}

            {quotes !== null && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No quotes match this view.
                </td>
              </tr>
            )}

            {filtered.map((quote) => (
              <tr
                key={quote.id}
                className="border-b border-hairline align-top last:border-b-0"
              >
                <td className="max-w-md px-4 py-4">
                  <p className="line-clamp-2 text-ink">{quote.text_en}</p>
                  {quote.text_id && (
                    <p className="mt-1 line-clamp-1 text-xs text-faint italic">
                      {quote.text_id}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {quote.tags.length === 0 && (
                      <span className="text-xs text-faint">—</span>
                    )}
                    {quote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-hairline px-1.5 py-0.5 text-[10px] tracking-wide text-muted uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        quote.published ? "bg-accent" : "bg-faint"
                      }`}
                    />
                    {quote.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-muted whitespace-nowrap">
                  {formatDate(quote.updated_at)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    {confirmId === quote.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(quote.id)}
                          disabled={deletingId === quote.id}
                          className="cursor-pointer text-xs font-medium text-accent-deep underline underline-offset-4 disabled:opacity-50"
                        >
                          {deletingId === quote.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="cursor-pointer text-xs text-muted underline underline-offset-4"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(quote)}
                          className="cursor-pointer text-xs font-medium text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(quote.id)}
                          className="cursor-pointer text-xs text-muted underline decoration-transparent underline-offset-4 hover:text-accent-deep hover:decoration-accent-deep"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor panel */}
      {editing && (
        <QuotePanel
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? null : editing}
          suggestions={tags}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onError={(message) => pushToast(message, "error")}
        />
      )}

      {/* Toasts */}
      <div className="pointer-events-none fixed right-5 bottom-24 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className={`reveal border px-4 py-2.5 text-sm shadow-sm ${
              toast.tone === "error"
                ? "border-accent/40 bg-paper text-accent-deep"
                : "border-hairline bg-paper text-ink"
            }`}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Quote editor panel                                                        */
/* -------------------------------------------------------------------------- */

function QuotePanel({
  initial,
  suggestions,
  onClose,
  onSave,
  onError,
}: {
  initial: Quote | null;
  suggestions: string[];
  onClose: () => void;
  onSave: (input: QuoteInput) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [textEn, setTextEn] = useState(initial?.text_en ?? "");
  const [textId, setTextId] = useState(initial?.text_id ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!textEn.trim()) return;

    setBusy(true);
    try {
      await onSave({
        text_en: textEn,
        text_id: textId,
        tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
        published,
      });
    } catch (saveError) {
      onError(errorMessage(saveError));
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-ink/25"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-hairline bg-paper">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <p className="label">{initial ? "Edit quote" : "New quote"}</p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-xs text-muted underline underline-offset-4 hover:text-ink"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="label">English</span>
            <textarea
              autoFocus
              required
              rows={4}
              value={textEn}
              onChange={(event) => setTextEn(event.target.value)}
              placeholder="The words, in English…"
              className="input font-display text-base"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="label">Indonesian</span>
            <textarea
              rows={4}
              value={textId}
              onChange={(event) => setTextId(event.target.value)}
              placeholder="Terjemahan Indonesia (opsional)…"
              className="input font-display text-base"
            />
            <span className="text-xs text-faint">
              Shown when the site language is Indonesian. Falls back to English
              when empty.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="label">Tags</span>
            <input
              type="text"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="rest, kindness"
              list="tag-suggestions"
              className="input"
            />
            <datalist id="tag-suggestions">
              {suggestions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <span className="text-xs text-faint">
              Comma separated. Existing tags: {suggestions.join(", ") || "none yet"}.
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4 accent-[color:var(--color-accent)]"
            />
            <span className="text-sm">
              Published{" "}
              <span className="text-muted">
                (unpublished quotes stay visible to you only)
              </span>
            </span>
          </label>

          <div className="mt-auto flex items-center gap-3 border-t border-hairline pt-5">
            <button
              type="submit"
              disabled={busy || !textEn.trim()}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Saving…" : initial ? "Save changes" : "Create quote"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
