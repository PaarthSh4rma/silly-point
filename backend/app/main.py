from fastapi import FastAPI

from app.api.routes_articles import router as admin_article_router
from app.api.routes_issues import admin_router as admin_issue_router
from app.api.routes_issues import public_router as public_issue_router
from app.api.routes_public_articles import router as public_article_router
from app.db import Base, engine
from app.models.article import ArticleModel
from app.models.issue import IssueArticleModel, IssueModel
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Silly Point API",
    description="Cricket news, caught daily.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(admin_article_router)
app.include_router(admin_issue_router)
app.include_router(public_issue_router)
app.include_router(public_article_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "silly-point-backend",
    }