from datetime import datetime
from pydantic import BaseModel, HttpUrl


class Article(BaseModel):
    title: str
    url: HttpUrl
    source: str
    published_at: datetime | None = None
    summary: str | None = None
    category: str | None = None