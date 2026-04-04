from datetime import datetime
from pydantic import BaseModel

from .models import QuestionStatus


# --- Event schemas ---

class EventCreate(BaseModel):
    title: str


class EventUpdate(BaseModel):
    title: str | None = None
    is_active: bool | None = None


class EventResponse(BaseModel):
    id: int
    title: str
    join_code: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class EventCreateResponse(EventResponse):
    host_token: str


# --- Question schemas ---

class QuestionCreate(BaseModel):
    body: str
    author_token: str


class QuestionUpvote(BaseModel):
    author_token: str


class QuestionUpdate(BaseModel):
    status: QuestionStatus


class QuestionResponse(BaseModel):
    id: int
    event_id: int
    body: str
    upvotes: int
    status: QuestionStatus
    created_at: datetime

    model_config = {"from_attributes": True}
