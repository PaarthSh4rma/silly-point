from datetime import datetime

from pydantic import BaseModel, EmailStr


class SubscriberCreate(BaseModel):
    email: EmailStr
    name: str | None = None


class SubscriberRead(BaseModel):
    id: int
    email: EmailStr
    name: str | None
    is_active: bool
    created_at: datetime