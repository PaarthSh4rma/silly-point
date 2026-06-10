from fastapi import APIRouter

from app.schemas.article import Article
from app.services.article_service import ArticleService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/fetch-news", response_model=list[Article])
def fetch_news():
    article_service = ArticleService()
    return article_service.fetch_latest_articles()