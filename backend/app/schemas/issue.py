from datetime import date
from pydantic import BaseModel

from app.schemas.article import Article


class IssueSection(BaseModel):
    name: str
    description: str
    articles: list[Article]


class Issue(BaseModel):
    issue_date: date
    title: str
    tagline: str
    sections: list[IssueSection]