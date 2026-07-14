from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.core.logging_config import logger

router = APIRouter(tags=["Real-Time Gateway"])

class ConnectionManager:
    """
    Manages active real-time WebSocket connections.
    Enables live status updates, urgent stock notifications, and clinical alarms.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        logger.info(f"Broadcasting WebSocket text: {message}")
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send broadcast text to connection: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint listening for live status exchanges.
    Allows clients to keep a live connection to obtain real-time notifications.
    """
    await manager.connect(websocket)
    try:
        # Send greeting message
        await manager.send_personal_message(
            f"Authorized command connection acknowledged for node: {client_id}", 
            websocket
        )
        while True:
            # Maintain active connection, echo back any sent packets for heartbeat checks
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Heartbeat echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket execution exception on client {client_id}: {e}")
        manager.disconnect(websocket)
