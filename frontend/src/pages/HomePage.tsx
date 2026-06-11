import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client";
import type { Issue } from "../types/issue";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type ThemeMode = "light" | "dark";

export function HomePage() {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const storedTheme = localStorage.getItem("silly-point-theme");
    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "dark";
  });

  useEffect(() => {
    localStorage.setItem("silly-point-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    async function loadLatestIssue() {
      try {
        const latestIssue = await apiGet<Issue>("/issues/latest");
        setIssue(latestIssue);
      } catch {
        setErrorMessage("No dispatch has been published yet.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLatestIssue();
  }, []);

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setSubscribeStatus("Enter an email first.");
      return;
    }

    setIsSubscribing(true);
    setSubscribeStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setEmail("");
      setSubscribeStatus(
        "You're in. The Daily Yorker will land in your inbox soon."
      );
    } catch {
      setSubscribeStatus("Could not subscribe right now. Try again in a moment.");
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <main className={getPageClassName(themeMode)}>
      <PitchBackground themeMode={themeMode} />

      <div className="relative mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <TopNav
          themeMode={themeMode}
          onToggleTheme={() =>
            setThemeMode((current) => (current === "dark" ? "light" : "dark"))
          }
        />

        <HeroSection issue={issue} themeMode={themeMode} />

        <section id="latest" className="mt-8">
          {isLoading && (
            <SurfaceCard themeMode={themeMode}>
              <p className={getMutedTextClassName(themeMode)}>
                Rolling the pitch... loading latest dispatch.
              </p>
            </SurfaceCard>
          )}

          {errorMessage && !isLoading && (
            <div
              className={
                themeMode === "dark"
                  ? "rounded-[2rem] border border-amber-300/30 bg-amber-300/10 p-7 text-amber-100 shadow-2xl"
                  : "rounded-[2rem] border border-amber-300 bg-amber-50 p-7 text-amber-900 shadow-sm"
              }
            >
              {errorMessage}
            </div>
          )}

          {issue && <LatestIssue issue={issue} themeMode={themeMode} />}
        </section>

        <SubscribeSection
          email={email}
          setEmail={setEmail}
          subscribeStatus={subscribeStatus}
          isSubscribing={isSubscribing}
          handleSubscribe={handleSubscribe}
          themeMode={themeMode}
        />
      </div>
    </main>
  );
}

function TopNav({
  themeMode,
  onToggleTheme,
}: {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}) {
return (
  <nav
    className={
      themeMode === "dark"
        ? "sticky top-0 z-50 mb-6 flex items-center justify-between rounded-full border border-white/10 bg-slate-950/75 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl"
        : "sticky top-0 z-50 mb-6 flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl"
    }
  >
    <a href="#" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-slate-950 shadow-lg shadow-emerald-500/20">
        SP
      </div>

      <div>
        <p
          className={
            themeMode === "dark"
              ? "text-sm font-black uppercase tracking-[0.3em] text-emerald-300"
              : "text-sm font-black uppercase tracking-[0.3em] text-emerald-700"
          }
        >
          Silly Point
        </p>
        <p className={getMutedTextClassName(themeMode)}>
          The Daily Yorker
        </p>
      </div>
    </a>

    <button
      type="button"
      onClick={onToggleTheme}
      className={
        themeMode === "dark"
          ? "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:border-slate-400"
      }
    >
      {themeMode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  </nav>
);
}

function HeroSection({
  issue,
  themeMode,
}: {
  issue: Issue | null;
  themeMode: ThemeMode;
}) {
  const articleCount = useMemo(() => {
    if (!issue) return 0;

    return issue.sections.reduce(
      (total, section) => total + section.articles.length,
      0
    );
  }, [issue]);

  return (
    <section
      className={
        themeMode === "dark"
          ? "overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30 backdrop-blur"
          : "overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      }
    >
      <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-8 md:p-10 lg:p-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge themeMode={themeMode}>Daily cricket brief</Badge>
            <Badge themeMode={themeMode}>No doomscrolling</Badge>
          </div>

          <h1
            className={
              themeMode === "dark"
                ? "max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl"
                : "max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl"
            }
          >
            Cricket news, caught daily.
          </h1>

          <p
            className={
              themeMode === "dark"
                ? "mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl"
                : "mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl"
            }
          >
            A premium daily cricket dispatch covering the stories that matter:
            squads, injuries, milestones, match fallout, and noise from around
            the grounds.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#latest"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              Read today's dispatch
            </a>

            <a
              href="#subscribe"
              className={
                themeMode === "dark"
                  ? "rounded-full border border-white/15 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  : "rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:border-slate-950"
              }
            >
              Subscribe
            </a>
          </div>
        </div>

        <aside
          className={
            themeMode === "dark"
              ? "border-t border-white/10 bg-emerald-400/10 p-8 lg:border-l lg:border-t-0 lg:p-10"
              : "border-t border-slate-200 bg-emerald-50 p-8 lg:border-l lg:border-t-0 lg:p-10"
          }
        >
          <p
            className={
              themeMode === "dark"
                ? "text-sm font-black uppercase tracking-[0.3em] text-emerald-300"
                : "text-sm font-black uppercase tracking-[0.3em] text-emerald-700"
            }
          >
            Match report
          </p>

          <div className="mt-7 space-y-4">
            <StatCard
              label="Latest issue"
              value={issue?.issue_date ?? "Pending"}
              themeMode={themeMode}
            />
            <StatCard
              label="Stories picked"
              value={articleCount ? String(articleCount) : "—"}
              themeMode={themeMode}
            />
            <StatCard
              label="Sections"
              value={issue ? String(issue.sections.length) : "—"}
              themeMode={themeMode}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function LatestIssue({
  issue,
  themeMode,
}: {
  issue: Issue;
  themeMode: ThemeMode;
}) {
  return (
    <article
      className={
        themeMode === "dark"
          ? "rounded-[2rem] border border-white/10 bg-slate-950/80 p-7 shadow-2xl shadow-black/30 backdrop-blur md:p-10"
          : "rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10"
      }
    >
      <header
        className={
          themeMode === "dark"
            ? "border-b border-white/10 pb-8"
            : "border-b border-slate-200 pb-8"
        }
      >
        <p
          className={
            themeMode === "dark"
              ? "text-sm font-black uppercase tracking-[0.35em] text-emerald-300"
              : "text-sm font-black uppercase tracking-[0.35em] text-emerald-700"
          }
        >
          {issue.issue_date}
        </p>

        <h2
          className={
            themeMode === "dark"
              ? "mt-4 text-4xl font-black tracking-tight text-white md:text-5xl"
              : "mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl"
          }
        >
          {issue.title}
        </h2>

        <p className={`mt-3 text-lg ${getMutedTextClassName(themeMode)}`}>
          {issue.tagline}
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {issue.sections.map((section, sectionIndex) => (
          <section key={section.name}>
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-slate-950">
                {sectionIndex + 1}
              </div>

              <div>
                <h3
                  className={
                    themeMode === "dark"
                      ? "text-3xl font-black tracking-tight text-white"
                      : "text-3xl font-black tracking-tight text-slate-950"
                  }
                >
                  {section.name}
                </h3>

                <p className={`mt-2 ${getMutedTextClassName(themeMode)}`}>
                  {section.description}
                </p>
              </div>
            </div>

            {section.articles.length === 0 ? (
              <div
                className={
                  themeMode === "dark"
                    ? "rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-400"
                    : "rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500"
                }
              >
                No stories in this section yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {section.articles.map((article, articleIndex) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    articleIndex={articleIndex}
                    themeMode={themeMode}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  articleIndex,
  themeMode,
}: {
  article: Issue["sections"][number]["articles"][number];
  articleIndex: number;
  themeMode: ThemeMode;
}) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className={
        themeMode === "dark"
          ? "group grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/60 hover:bg-emerald-400/10 md:grid-cols-[3rem_1fr]"
          : "group grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:bg-emerald-50/70 md:grid-cols-[3rem_1fr]"
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-sm font-black text-emerald-500">
        {articleIndex + 1}
      </div>

      <div>
        <div
          className={
            themeMode === "dark"
              ? "mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400"
              : "mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"
          }
        >
          <span>{article.source}</span>

          {article.category && (
            <>
              <span>•</span>
              <span>{formatCategory(article.category)}</span>
            </>
          )}

          {article.published_at && (
            <>
              <span>•</span>
              <span>{formatDate(article.published_at)}</span>
            </>
          )}
        </div>

        <h4
          className={
            themeMode === "dark"
              ? "text-xl font-black leading-snug text-white group-hover:text-emerald-300"
              : "text-xl font-black leading-snug text-slate-950 group-hover:text-emerald-800"
          }
        >
          {article.title}
        </h4>

        {article.summary && (
          <p className={`mt-3 line-clamp-3 text-sm leading-6 ${getMutedTextClassName(themeMode)}`}>
            {stripHtml(article.summary)}
          </p>
        )}

        <p
          className={
            themeMode === "dark"
              ? "mt-4 text-sm font-black text-emerald-300"
              : "mt-4 text-sm font-black text-emerald-700"
          }
        >
          Read full story →
        </p>
      </div>
    </a>
  );
}

type SubscribeSectionProps = {
  email: string;
  setEmail: (email: string) => void;
  subscribeStatus: string | null;
  isSubscribing: boolean;
  handleSubscribe: (event: FormEvent<HTMLFormElement>) => void;
  themeMode: ThemeMode;
};

function SubscribeSection({
  email,
  setEmail,
  subscribeStatus,
  isSubscribing,
  handleSubscribe,
  themeMode,
}: SubscribeSectionProps) {
  return (
    <section
      id="subscribe"
      className={
        themeMode === "dark"
          ? "mt-8 overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-8 shadow-2xl shadow-black/20 md:p-10"
          : "mt-8 overflow-hidden rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 shadow-sm md:p-10"
      }
    >
      <p
        className={
          themeMode === "dark"
            ? "mb-3 text-sm font-black uppercase tracking-[0.3em] text-emerald-300"
            : "mb-3 text-sm font-black uppercase tracking-[0.3em] text-emerald-700"
        }
      >
        Newsletter
      </p>

      <h2
        className={
          themeMode === "dark"
            ? "text-3xl font-black tracking-tight text-white md:text-4xl"
            : "text-3xl font-black tracking-tight text-slate-950 md:text-4xl"
        }
      >
        Get The Daily Yorker
      </h2>

      <p className={`mt-3 max-w-2xl text-lg leading-8 ${getMutedTextClassName(themeMode)}`}>
        Daily cricket stories in your inbox. No noise, no doomscrolling, just
        the day’s cricket in five minutes.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
          className={
            themeMode === "dark"
              ? "min-h-14 flex-1 rounded-full border border-white/10 bg-white px-6 text-base text-slate-950 outline-none placeholder:text-slate-400"
              : "min-h-14 flex-1 rounded-full border border-slate-200 bg-white px-6 text-base text-slate-950 outline-none placeholder:text-slate-400"
          }
        />

        <button
          type="submit"
          disabled={isSubscribing}
          className="min-h-14 rounded-full bg-emerald-500 px-8 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubscribing ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {subscribeStatus && (
        <p className={`mt-4 text-sm font-medium ${getMutedTextClassName(themeMode)}`}>
          {subscribeStatus}
        </p>
      )}
    </section>
  );
}

function SurfaceCard({
  children,
  themeMode,
}: {
  children: React.ReactNode;
  themeMode: ThemeMode;
}) {
  return (
    <div
      className={
        themeMode === "dark"
          ? "rounded-[2rem] border border-white/10 bg-slate-950/80 p-7 shadow-2xl shadow-black/30"
          : "rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
      }
    >
      {children}
    </div>
  );
}

function Badge({
  children,
  themeMode,
}: {
  children: React.ReactNode;
  themeMode: ThemeMode;
}) {
  return (
    <span
      className={
        themeMode === "dark"
          ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-300"
          : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700"
      }
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  themeMode,
}: {
  label: string;
  value: string;
  themeMode: ThemeMode;
}) {
  return (
    <div
      className={
        themeMode === "dark"
          ? "rounded-3xl border border-white/10 bg-white/[0.04] p-5"
          : "rounded-3xl border border-emerald-100 bg-white p-5"
      }
    >
      <p className={getMutedTextClassName(themeMode)}>{label}</p>
      <p
        className={
          themeMode === "dark"
            ? "mt-2 text-2xl font-black text-white"
            : "mt-2 text-2xl font-black text-slate-950"
        }
      >
        {value}
      </p>
    </div>
  );
}

function PitchBackground({ themeMode }: { themeMode: ThemeMode }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className={
          themeMode === "dark"
            ? "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_35%),linear-gradient(135deg,#020617_0%,#07111f_45%,#0f172a_100%)]"
            : "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,#f8fafc_0%,#ecfdf5_45%,#f8fafc_100%)]"
        }
      />

      <div
        className={
          themeMode === "dark"
            ? "absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] [background-size:72px_72px]"
            : "absolute inset-0 opacity-[0.22] [background-image:linear-gradient(90deg,#0f172a_1px,transparent_1px),linear-gradient(0deg,#0f172a_1px,transparent_1px)] [background-size:72px_72px]"
        }
      />
    </div>
  );
}

function getPageClassName(themeMode: ThemeMode) {
  return themeMode === "dark"
    ? "min-h-screen bg-slate-950 text-white"
    : "min-h-screen bg-slate-50 text-slate-950";
}

function getMutedTextClassName(themeMode: ThemeMode) {
  return themeMode === "dark" ? "text-slate-400" : "text-slate-600";
}

function formatCategory(category: string) {
  return category.replaceAll("_", " ");
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}