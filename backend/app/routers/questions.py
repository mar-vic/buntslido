from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..dependencies import get_db, get_event_or_404, verify_host
from ..limiter import limiter
from ..models import Event, QuestionStatus
from ..ws_manager import manager

router = APIRouter(prefix="/api/events/{join_code}/questions", tags=["questions"])

# In-memory upvote deduplication: set of (question_id, author_token)
_upvoted: set[tuple[int, str]] = set()


def _question_dict(q) -> dict:
    return {
        "id": q.id,
        "body": q.body,
        "upvotes": q.upvotes,
        "status": q.status,
        "created_at": q.created_at.isoformat(),
    }


@router.get("", response_model=list[schemas.QuestionResponse])
def list_questions(
    event: Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    return crud.get_questions(db, event.id, include_archived=False)


@router.get("/all", response_model=list[schemas.QuestionResponse])
def list_all_questions(
    event: Event = Depends(verify_host),
    db: Session = Depends(get_db),
):
    return crud.get_questions(db, event.id, include_archived=True)


@router.post("", response_model=schemas.QuestionResponse, status_code=201)
@limiter.limit("10/minute")
async def create_question(
    request: Request,
    data: schemas.QuestionCreate,
    event: Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    if not event.is_active:
        raise HTTPException(status_code=403, detail="Event is closed")
    question = crud.create_question(db, event.id, data)
    await manager.broadcast(
        event.id,
        {"type": "question_created", "question": _question_dict(question)},
    )
    return question


@router.post("/{question_id}/upvote", response_model=schemas.QuestionResponse)
@limiter.limit("30/minute")
async def upvote_question(
    request: Request,
    question_id: int,
    data: schemas.QuestionUpvote,
    event: Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
):
    question = crud.get_question(db, question_id)
    if not question or question.event_id != event.id:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.status != QuestionStatus.open:
        raise HTTPException(status_code=400, detail="Cannot upvote a non-open question")

    key = (question_id, data.author_token)
    if key in _upvoted:
        raise HTTPException(status_code=409, detail="Already upvoted")
    _upvoted.add(key)

    question = crud.upvote_question(db, question)
    await manager.broadcast(
        event.id,
        {"type": "question_upvoted", "question_id": question.id, "upvotes": question.upvotes},
    )
    return question


@router.patch("/{question_id}", response_model=schemas.QuestionResponse)
async def update_question(
    question_id: int,
    data: schemas.QuestionUpdate,
    event: Event = Depends(verify_host),
    db: Session = Depends(get_db),
):
    question = crud.get_question(db, question_id)
    if not question or question.event_id != event.id:
        raise HTTPException(status_code=404, detail="Question not found")
    question = crud.update_question_status(db, question, data)
    await manager.broadcast(
        event.id,
        {"type": "question_updated", "question_id": question.id, "status": question.status},
    )
    return question


@router.delete("/{question_id}", status_code=204)
async def delete_question(
    question_id: int,
    event: Event = Depends(verify_host),
    db: Session = Depends(get_db),
):
    question = crud.get_question(db, question_id)
    if not question or question.event_id != event.id:
        raise HTTPException(status_code=404, detail="Question not found")
    crud.delete_question(db, question)
    await manager.broadcast(event.id, {"type": "question_deleted", "question_id": question_id})
