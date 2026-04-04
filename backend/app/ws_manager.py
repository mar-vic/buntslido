import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._connections: dict[int, list[WebSocket]] = {}

    async def connect(self, event_id: int, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(event_id, []).append(ws)

    def disconnect(self, event_id: int, ws: WebSocket):
        conns = self._connections.get(event_id, [])
        if ws in conns:
            conns.remove(ws)

    async def broadcast(self, event_id: int, message: dict):
        conns = self._connections.get(event_id, [])
        dead = []
        for ws in conns:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            conns.remove(ws)


manager = ConnectionManager()
