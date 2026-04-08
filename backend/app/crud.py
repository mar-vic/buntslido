import hashlib
import secrets
import string
from sqlalchemy.orm import Session

from . import models, schemas


def _random_join_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_event(db: Session, data: schemas.EventCreate) -> models.Event:
    event = models.Event(
        title=data.title,
        join_code=_random_join_code(),
        host_token=secrets.token_hex(32),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_event_by_join_code(db: Session, join_code: str) -> models.Event | None:
    return db.query(models.Event).filter(models.Event.join_code == join_code).first()


def get_event_by_host_token(db: Session, host_token: str) -> models.Event | None:
    return db.query(models.Event).filter(models.Event.host_token == host_token).first()


def update_event(db: Session, event: models.Event, data: schemas.EventUpdate) -> models.Event:
    if data.title is not None:
        event.title = data.title
    if data.is_active is not None:
        event.is_active = data.is_active
    db.commit()
    db.refresh(event)
    return event


def get_questions(db: Session, event_id: int, include_archived: bool = False) -> list[models.Question]:
    q = db.query(models.Question).filter(models.Question.event_id == event_id)
    if not include_archived:
        q = q.filter(models.Question.status != models.QuestionStatus.archived)
    return q.order_by(models.Question.upvotes.desc(), models.Question.created_at.asc()).all()


def create_question(db: Session, event_id: int, data: schemas.QuestionCreate) -> models.Question:
    token_hash = hashlib.sha256(data.author_token.encode()).hexdigest()
    question = models.Question(event_id=event_id, body=data.body, author_token=token_hash)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def get_question(db: Session, question_id: int) -> models.Question | None:
    return db.query(models.Question).filter(models.Question.id == question_id).first()


def upvote_question(db: Session, question: models.Question) -> models.Question:
    question.upvotes += 1
    db.commit()
    db.refresh(question)
    return question


def update_question_status(
    db: Session, question: models.Question, data: schemas.QuestionUpdate
) -> models.Question:
    question.status = data.status
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question: models.Question) -> None:
    db.delete(question)
    db.commit()
