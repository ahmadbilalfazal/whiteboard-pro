import WebSocket from 'ws';
import ShortUUID from 'short-uuid';
import { RoomState, UserMeta, Stroke } from './types';
import { joinRoom, leaveRoom, getRoom, addStroke, undoStroke, setLock, replaceStrokes } from './roomManager';
import Redis from 'ioredis';
import { saveRoomSnapshot, loadRoomSnapshot } from './persist';
const uid = new ShortUUID();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export function setupWS(server: any) {
  const wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', async (ws: WebSocket, req: any) => {
    const qs = new URLSearchParams(req.url?.split('?')[1] || '');
    const roomId = qs.get('roomId') || uid().slice(0,6);
    const userId = qs.get('userId') || uid().slice(0,8);
    const name = qs.get('name') || `User-${userId.slice(0,4)}`;
    const color = qs.get('color') || `#${Math.floor(Math.random()*16777215).toString(16).slice(0,6)}`;
    const meta: UserMeta = { socketId: uid(), userId, name, color, role: 'editor' };
    const snapshot = await loadRoomSnapshot(process.env.MONGO_URI || 'mongodb://localhost:27017/whiteboard', roomId);
    if (snapshot) replaceStrokes(roomId, snapshot.strokes || []);
    const room = joinRoom(roomId, meta);
    const joinMsg = JSON.stringify({ type: 'room:state', payload: { roomId, users: Object.values(room.users), strokes: room.strokes, locked: room.locked } });
    ws.send(joinMsg);
    broadcast(wss, roomId, { type: 'presence', payload: { users: Object.values(room.users) } });
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        await handleMessage(ws, wss, roomId, meta, msg);
      } catch {}
    });
    ws.on('close', () => {
      leaveRoom(roomId, meta.socketId);
      broadcast(wss, roomId, { type: 'presence', payload: { users: Object.values(getRoom(roomId)?.users || {}) } });
    });
  });
}
async function handleMessage(ws: any, wss: any, roomId: string, meta: UserMeta, msg: any) {
  const type = msg.type;
  if (type === 'draw:start' || type === 'draw:move' || type === 'draw:end') {
    if (getRoom(roomId)?.locked) return;
    if (type === 'draw:end') {
      const s: Stroke = msg.payload.stroke;
      addStroke(roomId, s);
      broadcast(wss, roomId, { type: 'draw:end', payload: { stroke: s } });
    } else {
      broadcast(wss, roomId, msg, meta.socketId);
    }
  }
  if (type === 'cursor:move') {
    broadcast(wss, roomId, msg, meta.socketId);
  }
  if (type === 'stroke:undo') {
    undoStroke(roomId);
    broadcast(wss, roomId, { type: 'strokes:replace', payload: { strokes: getRoom(roomId)?.strokes || [] } });
  }
  if (type === 'board:clear') {
    replaceStrokes(roomId, []);
    broadcast(wss, roomId, { type: 'strokes:replace', payload: { strokes: [] } });
  }
  if (type === 'room:save') {
    const r = getRoom(roomId);
    if (r) await saveRoomSnapshot(process.env.MONGO_URI || 'mongodb://localhost:27017/whiteboard', r);
  }
}
function broadcast(wss: any, roomId: string, msg: any, exceptSocketId?: string) {
  const data = JSON.stringify(msg);
  wss.clients.forEach((c: any) => {
    try { if (c.readyState === 1) c.send(data); } catch {}
  });
}
