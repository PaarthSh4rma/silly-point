from datetime import date

from app.schemas.article import Article
from app.schemas.issue import Issue, IssueSection
from app.services.article_service import ArticleService
from app.services.ranking_service import ArticleRankingService


class IssueService:
    def __init__(
        self,
        article_service: ArticleService | None = None,
        ranking_service: ArticleRankingService | None = None,
    ):
        self.article_service = article_service or ArticleService()
        self.ranking_service = ranking_service or ArticleRankingService()

    def generate_today_issue(self) -> Issue:
        articles = self.article_service.fetch_latest_articles()
        ranked_articles = self.ranking_service.rank_articles(articles)

        return Issue(
            issue_date=date.today(),
            title="The Daily Yorker",
            tagline="Cricket news, caught daily.",
            sections=self._build_sections(ranked_articles),
        )

    def _build_sections(self, articles: list[Article]) -> list[IssueSection]:
        opening_spell = articles[:3]
        powerplay = articles[3:8]
        around_the_grounds = articles[8:15]

        return [
            IssueSection(
                name="Opening Spell",
                description="The biggest cricket stories of the day.",
                articles=opening_spell,
            ),
            IssueSection(
                name="Powerplay",
                description="Quick updates worth knowing.",
                articles=powerplay,
            ),
            IssueSection(
                name="Around the Grounds",
                description="More stories from across world cricket.",
                articles=around_the_grounds,
            ),
        ]