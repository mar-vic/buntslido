from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from .. import crud
from ..database import SessionLocal
from ..ws_manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/{join_code}")
async def websocket_endpoint(join_code: str, ws: WebSocket):
    db = SessionLocal()
    try:
        event = crud.get_event_by_join_code(db, join_code)
    finally:
        db.close()

    if not event:
        await ws.close(code=4004)
        return

    await manager.connect(event.id, ws)
    try:
        while True:
            # Keep connection alive; we don't process incoming messages
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(event.id, ws)
