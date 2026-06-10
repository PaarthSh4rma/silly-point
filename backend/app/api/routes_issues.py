from fastapi import APIRouter

from app.schemas.issue import Issue
from app.services.issue_service import IssueService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/generate-issue", response_model=Issue)
def generate_issue():
    issue_service = IssueService()
    return issue_service.generate_today_issue()