import { MongoClient } from 'mongodb';
import { RoomState } from './types';
let client: MongoClient | null = null;
async function getClient(uri: string) {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}
export async function saveRoomSnapshot(uri: string, room: RoomState) {
  const c = await getClient(uri);
  const db = c.db();
  await db.collection('rooms').updateOne({ _id: room.id }, { $set: { ...room, _id: room.id } }, { upsert: true });
}
export async function loadRoomSnapshot(uri: string, roomId: string) {
  const c = await getClient(uri);
  const db = c.db();
  const doc = await db.collection('rooms').findOne({ _id: roomId });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return rest as RoomState;
}
