from pydantic import BaseModel
from datetime import datetime
from app.models.follows import FollowerProfile


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    actor_id: str
    type: str
    reference_id: str | None = None
    is_read: bool = False
    created_at: datetime
    actor: FollowerProfile | None = None


class UnreadCountResponse(BaseModel):
    count: int
