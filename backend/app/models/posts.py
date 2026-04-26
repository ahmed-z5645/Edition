from pydantic import BaseModel
from datetime import datetime


class PostResponse(BaseModel):
    id: str
    user_id: str
    week_number: int
    year: int
    title: str | None = None
    is_published: bool = False
    is_late: bool = False
    word_count: int = 0
    published_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PostCreate(BaseModel):
    week_number: int
    year: int


class PostUpdate(BaseModel):
    title: str | None = None
