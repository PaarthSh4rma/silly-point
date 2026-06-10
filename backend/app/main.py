from fastapi import FastAPI

from app.api.routes_articles import router as article_router

app = FastAPI(
    title="Silly Point API",
    description="Cricket news, caught daily.",
    version="0.1.0",
)

app.include_router(article_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "silly-point-backend",
    }