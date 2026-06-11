from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.repositories.issue_repository import IssueRepository
from app.schemas.issue import Issue, IssueRead
from app.services.issue_service import IssueService

admin_router = APIRouter(prefix="/admin", tags=["admin"])
public_router = APIRouter(prefix="/issues", tags=["issues"])


@admin_router.post("/generate-issue", response_model=IssueRead)
def generate_issue(db: Session = Depends(get_db)):
    issue_service = IssueService()
    return issue_service.generate_and_save_today_issue(db)


@admin_router.post("/preview-issue", response_model=Issue)
def preview_issue():
    issue_service = IssueService()
    return issue_service.generate_today_issue()


@public_router.get("/latest", response_model=IssueRead)
def get_latest_issue(db: Session = Depends(get_db)):
    issue_repository = IssueRepository(db)
    latest_issue = issue_repository.get_latest_issue()

    if not latest_issue:
        raise HTTPException(status_code=404, detail="No issue has been published yet.")

    return issue_repository.to_read_schema(latest_issue)