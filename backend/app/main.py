from fastapi import FastAPI

from app.api.routes_articles import router as admin_article_router
from app.api.routes_issues import router as issue_router
from app.api.routes_public_articles import router as public_article_router
from app.db import Base, engine
from app.models.article import ArticleModel

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Silly Point API",
    description="Cricket news, caught daily.",
    version="0.1.0",
)

app.include_router(admin_article_router)
app.include_router(issue_router)
app.include_router(public_article_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "silly-point-backend",
    }