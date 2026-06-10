from datetime import datetime
from email.utils import parsedate_to_datetime

import feedparser

from app.schemas.article import Article
from app.services.feed_sources.base import FeedSource


class RSSFeedSource(FeedSource):
    def __init__(self, name: str, url: str, category: str | None = None):
        self.name = name
        self.url = url
        self.category = category

    def fetch_articles(self) -> list[Article]:
        parsed_feed = feedparser.parse(self.url)

        articles: list[Article] = []

        for entry in parsed_feed.entries:
            title = getattr(entry, "title", None)
            link = getattr(entry, "link", None)

            if not title or not link:
                continue

            articles.append(
                Article(
                    title=title.strip(),
                    url=link,
                    source=self.name,
                    published_at=self._parse_published_at(entry),
                    summary=self._extract_summary(entry),
                    category=self.category,
                )
            )

        return articles

    def _parse_published_at(self, entry) -> datetime | None:
        published = getattr(entry, "published", None)

        if not published:
            return None

        try:
            return parsedate_to_datetime(published)
        except Exception:
            return None

    def _extract_summary(self, entry) -> str | None:
        summary = getattr(entry, "summary", None)

        if not summary:
            return None

        return summary.strip()