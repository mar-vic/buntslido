from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..dependencies import get_db, get_event_or_404, verify_host
from ..models import Event
from ..ws_manager import manager

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[schemas.EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.created_at.desc()).all()


@router.post("", response_model=schemas.EventCreateResponse, status_code=201)
def create_event(data: schemas.EventCreate, db: Session = Depends(get_db)):
    event = crud.create_event(db, data)
    return event


@router.get("/{join_code}", response_model=schemas.EventResponse)
def get_event(event: Event = Depends(get_event_or_404)):
    return event


@router.delete("/{join_code}", status_code=204)
def delete_event(
    db: Session = Depends(get_db),
    event: Event = Depends(verify_host),
):
    db.delete(event)
    db.commit()


@router.patch("/{join_code}", response_model=schemas.EventResponse)
async def update_event(
    data: schemas.EventUpdate,
    db: Session = Depends(get_db),
    event: Event = Depends(verify_host),
):
    event = crud.update_event(db, event, data)
    await manager.broadcast(
        event.id,
        {"type": "event_updated", "is_active": event.is_active, "title": event.title},
    )
    return event
