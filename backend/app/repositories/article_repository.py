from sqlalchemy.orm import Session

from app.models.article import ArticleModel
from app.schemas.article import Article


class ArticleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_if_not_exists(self, article: Article) -> ArticleModel:
        existing_article = (
            self.db.query(ArticleModel)
            .filter(ArticleModel.url == str(article.url))
            .first()
        )

        if existing_article:
            return existing_article

        article_model = ArticleModel(
            title=article.title,
            url=str(article.url),
            source=article.source,
            published_at=article.published_at,
            summary=article.summary,
            category=article.category,
        )

        self.db.add(article_model)
        self.db.commit()
        self.db.refresh(article_model)

        return article_model

    def create_many_if_not_exists(self, articles: list[Article]) -> list[ArticleModel]:
        saved_articles: list[ArticleModel] = []

        for article in articles:
            saved_articles.append(self.create_if_not_exists(article))

        return saved_articles

    def get_latest(self, limit: int = 50) -> list[ArticleModel]:
        return (
            self.db.query(ArticleModel)
            .order_by(ArticleModel.published_at.desc().nullslast(), ArticleModel.created_at.desc())
            .limit(limit)
            .all()
        )