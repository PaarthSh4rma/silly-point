from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.repositories.article_repository import ArticleRepository
from app.schemas.article import Article

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[Article])
def get_articles(db: Session = Depends(get_db), limit: int = 50):
    article_repository = ArticleRepository(db)
    latest_articles = article_repository.get_latest(limit=limit)

    return [
        Article(
            title=article.title,
            url=article.url,
            source=article.source,
            published_at=article.published_at,
            summary=article.summary,
            category=article.category,
        )
        for article in latest_articles
    ]