from fastapi import Depends, Header, HTTPException, Path
from sqlalchemy.orm import Session

from . import crud, models
from .database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_event_or_404(
    join_code: str = Path(...),
    db: Session = Depends(get_db),
) -> models.Event:
    event = crud.get_event_by_join_code(db, join_code)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def verify_host(
    event: models.Event = Depends(get_event_or_404),
    x_host_token: str | None = Header(default=None),
) -> models.Event:
    if not x_host_token or x_host_token != event.host_token:
        raise HTTPException(status_code=403, detail="Invalid host token")
    return event
