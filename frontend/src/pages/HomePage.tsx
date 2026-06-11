import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { Issue } from "../types/issue";

export function HomePage() {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Silly Point
          </p>

          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950">
            Cricket news, caught daily.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A sharp daily cricket dispatch covering the biggest stories, quick
            updates, and everything worth knowing from around the grounds.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#latest"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Read today's dispatch
            </a>

            <a
              href="#subscribe"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Subscribe
            </a>
          </div>
        </div>

        <section id="latest">
          {isLoading && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Loading latest dispatch...
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              {errorMessage}
            </div>
          )}

          {issue && (
            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8 border-b border-slate-200 pb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {issue.issue_date}
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  {issue.title}
                </h2>

                <p className="mt-2 text-slate-600">{issue.tagline}</p>
              </div>

              <div className="space-y-10">
                {issue.sections.map((section) => (
                  <section key={section.name}>
                    <div className="mb-4">
                      <h3 className="text-2xl font-extrabold text-slate-950">
                        {section.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {section.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {section.articles.map((article) => (
                        <a
                          key={article.id}
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-400 hover:bg-emerald-50/40"
                        >
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <span>{article.source}</span>
                            {article.category && <span>• {article.category}</span>}
                          </div>

                          <h4 className="text-lg font-bold leading-snug text-slate-950">
                            {article.title}
                          </h4>

                          {article.summary && (
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                              {article.summary}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          )}
        </section>

        <section
          id="subscribe"
          className="mt-10 rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm"
        >
          <h2 className="text-2xl font-black">Get The Daily Yorker</h2>
          <p className="mt-2 max-w-xl text-slate-300">
            Daily cricket stories in your inbox. No noise, no doomscrolling,
            just the day’s cricket in five minutes.
          </p>

          <form className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@example.com"
              className="min-h-12 flex-1 rounded-full border border-white/10 bg-white px-5 text-slate-950 outline-none"
            />

            <button
              type="button"
              className="min-h-12 rounded-full bg-emerald-500 px-6 font-semibold text-slate-950"
            >
              Subscribe
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}