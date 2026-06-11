from datetime import date
from pydantic import BaseModel

from app.schemas.article import Article, ArticleRead


class IssueSection(BaseModel):
    name: str
    description: str
    articles: list[Article]


class Issue(BaseModel):
    issue_date: date
    title: str
    tagline: str
    sections: list[IssueSection]


class IssueSectionRead(BaseModel):
    name: str
    description: str
    articles: list[ArticleRead]


class IssueRead(BaseModel):
    id: int
    issue_date: date
    title: str
    tagline: str
    status: str
    sections: list[IssueSectionRead]