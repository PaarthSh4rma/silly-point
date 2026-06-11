import { FormEvent, useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { Issue } from "../types/issue";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export function HomePage() {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

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
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <HeroSection />

        <section id="latest" className="mt-10">
          {isLoading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-slate-600">Loading latest dispatch...</p>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="rounded-3xl border border-amber-300 bg-amber-50 p-8 text-amber-900 shadow-sm">
              {errorMessage}
            </div>
          )}

          {issue && <LatestIssue issue={issue} />}
        </section>

        <SubscribeSection
          email={email}
          setEmail={setEmail}
          subscribeStatus={subscribeStatus}
          isSubscribing={isSubscribing}
          handleSubscribe={handleSubscribe}
        />
      </section>
    </main>
  );
}

function HeroSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-emerald-700">
        Silly Point
      </p>

      <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
        Cricket news, caught daily.
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
        A sharp daily cricket dispatch covering the biggest stories, quick
        updates, and everything worth knowing from around the grounds.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#latest"
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Read today's dispatch
        </a>

        <a
          href="#subscribe"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:border-slate-950"
        >
          Subscribe
        </a>
      </div>
    </section>
  );
}

function LatestIssue({ issue }: { issue: Issue }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-700">
          {issue.issue_date}
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
          {issue.title}
        </h2>

        <p className="mt-3 text-lg text-slate-600">{issue.tagline}</p>
      </header>

      <div className="mt-10 space-y-12">
        {issue.sections.map((section) => (
          <section key={section.name}>
            <div className="mb-5">
              <h3 className="text-3xl font-black tracking-tight text-slate-950">
                {section.name}
              </h3>

              <p className="mt-2 text-slate-500">{section.description}</p>
            </div>

            {section.articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                No stories in this section yet.
              </div>
            ) : (
              <div className="space-y-4">
                {section.articles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-400 hover:bg-emerald-50/40"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
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

                    <h4 className="text-xl font-black leading-snug text-slate-950 group-hover:text-emerald-800">
                      {article.title}
                    </h4>

                    {article.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {stripHtml(article.summary)}
                      </p>
                    )}

                    <p className="mt-4 text-sm font-bold text-emerald-700">
                      Read full story →
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

type SubscribeSectionProps = {
  email: string;
  setEmail: (email: string) => void;
  subscribeStatus: string | null;
  isSubscribing: boolean;
  handleSubscribe: (event: FormEvent<HTMLFormElement>) => void;
};

function SubscribeSection({
  email,
  setEmail,
  subscribeStatus,
  isSubscribing,
  handleSubscribe,
}: SubscribeSectionProps) {
  return (
    <section
      id="subscribe"
      className="mt-10 rounded-3xl border border-slate-900 bg-slate-950 p-8 text-white shadow-sm md:p-10"
    >
      <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-emerald-400">
        Newsletter
      </p>

      <h2 className="text-3xl font-black tracking-tight md:text-4xl">
        Get The Daily Yorker
      </h2>

      <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">
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
          className="min-h-14 flex-1 rounded-full border border-white/10 bg-white px-6 text-base text-slate-950 outline-none placeholder:text-slate-400"
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
        <p className="mt-4 text-sm font-medium text-slate-300">
          {subscribeStatus}
        </p>
      )}
    </section>
  );
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