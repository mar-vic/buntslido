import enum
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class QuestionStatus(str, enum.Enum):
    open = "open"
    answered = "answered"
    archived = "archived"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    join_code: Mapped[str] = mapped_column(String(12), unique=True, nullable=False, index=True)
    host_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    questions: Mapped[list["Question"]] = relationship(back_populates="event", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = (Index("ix_questions_event_id", "event_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    body: Mapped[str] = mapped_column(String(500), nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[QuestionStatus] = mapped_column(
        Enum(QuestionStatus), default=QuestionStatus.open
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    author_token: Mapped[str] = mapped_column(String(64), nullable=False)

    event: Mapped["Event"] = relationship(back_populates="questions")
