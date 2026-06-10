from app.schemas.article import Article


class ArticleRankingService:
    """
    Cricket-aware article ranking.

    This is intentionally simple for MVP, but isolated so we can later replace
    it with ML/LLM ranking without touching routes or issue generation.
    """

    HIGH_VALUE_KEYWORDS = {
        "india": 5,
        "australia": 4,
        "test": 4,
        "world cup": 5,
        "ipl": 5,
        "ashes": 5,
        "wtc": 5,
        "injury": 4,
        "squad": 4,
        "captain": 3,
        "record": 3,
        "hundred": 3,
        "century": 3,
        "final": 4,
        "semi-final": 4,
        "bcci": 4,
        "icc": 4,
    }

    def rank_articles(self, articles: list[Article]) -> list[Article]:
        return sorted(
            articles,
            key=self.score_article,
            reverse=True,
        )

    def score_article(self, article: Article) -> int:
        text = f"{article.title} {article.summary or ''}".lower()

        score = 0

        for keyword, weight in self.HIGH_VALUE_KEYWORDS.items():
            if keyword in text:
                score += weight

        if article.published_at:
            score += 2

        return score