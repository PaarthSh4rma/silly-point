from abc import ABC, abstractmethod

from app.schemas.article import Article


class FeedSource(ABC):
    """
    Base interface for any news source.

    RSS, APIs, scrapers, or custom providers should all implement this.
    """

    @abstractmethod
    def fetch_articles(self) -> list[Article]:
        pass