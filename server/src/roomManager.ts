import { RoomState, UserMeta, Stroke } from './types';
const rooms = new Map<string, RoomState>();
export function createRoom(id: string) {
  const r: RoomState = { id, users: {}, strokes: [], locked: false };
  rooms.set(id, r);
  return r;
}
export function getRoom(id: string) { return rooms.get(id) || null; }
export function joinRoom(roomId: string, meta: UserMeta) {
  let r = getRoom(roomId);
  if (!r) r = createRoom(roomId);
  r.users[meta.socketId] = meta;
  const isFirst = Object.keys(r.users).length === 1;
  if (isFirst) r.users[meta.socketId].role = 'admin';
  return r;
}
export function leaveRoom(roomId: string, socketId: string) {
  const r = getRoom(roomId);
  if (!r) return null;
  delete r.users[socketId];
  return r;
}
export function addStroke(roomId: string, s: Stroke) {
  const r = getRoom(roomId);
  if (!r) return null;
  r.strokes.push(s);
  return r;
}
export function undoStroke(roomId: string) {
  const r = getRoom(roomId);
  if (!r) return null;
  const s = r.strokes.pop() || null;
  return { room: r, removed: s };
}
export function replaceStrokes(roomId: string, strokes: Stroke[]) {
  const r = getRoom(roomId);
  if (!r) return null;
  r.strokes = strokes;
  return r;
}
export function setLock(roomId: string, locked: boolean) {
  const r = getRoom(roomId);
  if (!r) return null;
  r.locked = locked;
  return r;
}
