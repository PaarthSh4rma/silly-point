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

      <div className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <TopNav
          themeMode={themeMode}
          onToggleTheme={() =>
            setThemeMode((current) => (current === "dark" ? "light" : "dark"))
          }
        />

        <HeroSection issue={issue} themeMode={themeMode} />

        <section id="latest" className="mt-6 sm:mt-8">
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
                  ? "rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100 shadow-2xl sm:p-7 sm:text-base"
                  : "rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm sm:p-7 sm:text-base"
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
          ? "sticky top-3 z-50 mb-5 flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-3 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:top-4 sm:mb-6 sm:rounded-full sm:px-4"
          : "sticky top-3 z-50 mb-5 flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/85 px-3 py-3 shadow-sm backdrop-blur-xl sm:top-4 sm:mb-6 sm:rounded-full sm:px-4"
      }
    >
      <a href="#" className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 sm:h-11 sm:w-11 sm:text-lg">
          SP
        </div>

        <div className="min-w-0">
          <p
            className={
              themeMode === "dark"
                ? "truncate text-xs font-black uppercase tracking-[0.2em] text-emerald-300 sm:text-sm sm:tracking-[0.3em]"
                : "truncate text-xs font-black uppercase tracking-[0.2em] text-emerald-700 sm:text-sm sm:tracking-[0.3em]"
            }
          >
            Silly Point
          </p>
          <p className={`truncate text-xs sm:text-sm ${getMutedTextClassName(themeMode)}`}>
            The Daily Yorker
          </p>
        </div>
      </a>

      <button
        type="button"
        onClick={onToggleTheme}
        className={
          themeMode === "dark"
            ? "shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:px-4 sm:text-sm"
            : "shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:border-slate-400 sm:px-4 sm:text-sm"
        }
      >
        <span className="sm:hidden">{themeMode === "dark" ? "Light" : "Dark"}</span>
        <span className="hidden sm:inline">
          {themeMode === "dark" ? "Light mode" : "Dark mode"}
        </span>
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
          ? "overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-[2rem]"
          : "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:rounded-[2rem]"
      }
    >
      <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge themeMode={themeMode}>Daily cricket brief</Badge>
            <Badge themeMode={themeMode}>No doomscrolling</Badge>
          </div>

          <h1
            className={
              themeMode === "dark"
                ? "max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                : "max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl"
            }
          >
            Cricket news, caught daily.
          </h1>

          <p
            className={
              themeMode === "dark"
                ? "mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl"
                : "mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl"
            }
          >
            A premium daily cricket dispatch covering the stories that matter:
            squads, injuries, milestones, match fallout, and noise from around
            the grounds.
          </p>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <a
              href="#latest"
              className="w-full rounded-full bg-emerald-500 px-6 py-3 text-center text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:w-auto"
            >
              Read today's dispatch
            </a>

            <a
              href="#subscribe"
              className={
                themeMode === "dark"
                  ? "w-full rounded-full border border-white/15 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white/10 sm:w-auto"
                  : "w-full rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-black text-slate-950 transition hover:border-slate-950 sm:w-auto"
              }
            >
              Subscribe
            </a>
          </div>
        </div>

        <aside
          className={
            themeMode === "dark"
              ? "border-t border-white/10 bg-emerald-400/10 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10"
              : "border-t border-slate-200 bg-emerald-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10"
          }
        >
          <p
            className={
              themeMode === "dark"
                ? "text-xs font-black uppercase tracking-[0.25em] text-emerald-300 sm:text-sm sm:tracking-[0.3em]"
                : "text-xs font-black uppercase tracking-[0.25em] text-emerald-700 sm:text-sm sm:tracking-[0.3em]"
            }
          >
            Match report
          </p>

          <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-3 lg:grid-cols-1 lg:space-y-1">
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
          ? "rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-[2rem] sm:p-7 md:p-10"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-7 md:p-10"
      }
    >
      <header
        className={
          themeMode === "dark"
            ? "border-b border-white/10 pb-6 sm:pb-8"
            : "border-b border-slate-200 pb-6 sm:pb-8"
        }
      >
        <p
          className={
            themeMode === "dark"
              ? "text-xs font-black uppercase tracking-[0.25em] text-emerald-300 sm:text-sm sm:tracking-[0.35em]"
              : "text-xs font-black uppercase tracking-[0.25em] text-emerald-700 sm:text-sm sm:tracking-[0.35em]"
          }
        >
          {issue.issue_date}
        </p>

        <h2
          className={
            themeMode === "dark"
              ? "mt-3 text-3xl font-black tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl"
              : "mt-3 text-3xl font-black tracking-tight text-slate-950 sm:mt-4 sm:text-4xl md:text-5xl"
          }
        >
          {issue.title}
        </h2>

        <p className={`mt-3 text-base sm:text-lg ${getMutedTextClassName(themeMode)}`}>
          {issue.tagline}
        </p>
      </header>

      <div className="mt-8 space-y-10 sm:mt-10 sm:space-y-12">
        {issue.sections.map((section, sectionIndex) => (
          <section key={section.name}>
            <div className="mb-5 flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-slate-950 sm:h-11 sm:w-11">
                {sectionIndex + 1}
              </div>

              <div className="min-w-0">
                <h3
                  className={
                    themeMode === "dark"
                      ? "text-2xl font-black tracking-tight text-white sm:text-3xl"
                      : "text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
                  }
                >
                  {section.name}
                </h3>

                <p className={`mt-1 text-sm sm:mt-2 sm:text-base ${getMutedTextClassName(themeMode)}`}>
                  {section.description}
                </p>
              </div>
            </div>

            {section.articles.length === 0 ? (
              <div
                className={
                  themeMode === "dark"
                    ? "rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400 sm:p-5"
                    : "rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 sm:p-5"
                }
              >
                No stories in this section yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
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
          ? "group grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/60 hover:bg-emerald-400/10 sm:p-5 md:grid-cols-[3rem_1fr]"
          : "group grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:bg-emerald-50/70 sm:p-5 md:grid-cols-[3rem_1fr]"
      }
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-sm font-black text-emerald-500 sm:h-12 sm:w-12">
        {articleIndex + 1}
      </div>

      <div className="min-w-0">
        <div
          className={
            themeMode === "dark"
              ? "mb-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-black uppercase tracking-wide text-slate-400 sm:text-xs"
              : "mb-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-black uppercase tracking-wide text-slate-500 sm:text-xs"
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
              ? "text-lg font-black leading-snug text-white group-hover:text-emerald-300 sm:text-xl"
              : "text-lg font-black leading-snug text-slate-950 group-hover:text-emerald-800 sm:text-xl"
          }
        >
          {article.title}
        </h4>

        {article.summary && (
          <p
            className={`mt-3 line-clamp-4 text-sm leading-6 sm:line-clamp-3 ${getMutedTextClassName(themeMode)}`}
          >
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
          ? "mt-6 overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-2xl shadow-black/20 sm:mt-8 sm:rounded-[2rem] sm:p-8 md:p-10"
          : "mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:mt-8 sm:rounded-[2rem] sm:p-8 md:p-10"
      }
    >
      <p
        className={
          themeMode === "dark"
            ? "mb-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-300 sm:text-sm sm:tracking-[0.3em]"
            : "mb-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-700 sm:text-sm sm:tracking-[0.3em]"
        }
      >
        Newsletter
      </p>

      <h2
        className={
          themeMode === "dark"
            ? "text-3xl font-black tracking-tight text-white sm:text-4xl"
            : "text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
        }
      >
        Get The Daily Yorker
      </h2>

      <p
        className={`mt-3 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${getMutedTextClassName(themeMode)}`}
      >
        Daily cricket stories in your inbox. No noise, no doomscrolling, just
        the day’s cricket in five minutes.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="mt-6 grid max-w-2xl gap-3 sm:mt-8 sm:grid-cols-[1fr_auto]"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
          className={
            themeMode === "dark"
              ? "min-h-14 w-full rounded-full border border-white/10 bg-white px-5 text-base text-slate-950 outline-none placeholder:text-slate-400 sm:px-6"
              : "min-h-14 w-full rounded-full border border-slate-200 bg-white px-5 text-base text-slate-950 outline-none placeholder:text-slate-400 sm:px-6"
          }
        />

        <button
          type="submit"
          disabled={isSubscribing}
          className="min-h-14 w-full rounded-full bg-emerald-500 px-8 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
          ? "rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 sm:rounded-[2rem] sm:p-7"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-7"
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
          ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-emerald-300 sm:text-xs"
          : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-emerald-700 sm:text-xs"
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
          ? "rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
          : "rounded-3xl border border-emerald-100 bg-white p-4 sm:p-5"
      }
    >
      <p className={`text-xs sm:text-sm ${getMutedTextClassName(themeMode)}`}>
        {label}
      </p>
      <p
        className={
          themeMode === "dark"
            ? "mt-2 break-words text-xl font-black text-white sm:text-2xl"
            : "mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl"
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
            ? "absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] [background-size:56px_56px] sm:[background-size:72px_72px]"
            : "absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,#0f172a_1px,transparent_1px),linear-gradient(0deg,#0f172a_1px,transparent_1px)] [background-size:56px_56px] sm:[background-size:72px_72px]"
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