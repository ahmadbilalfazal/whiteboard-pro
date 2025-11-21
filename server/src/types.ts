export type Point = { x: number; y: number; t: number };
export type Stroke = { id: string; userId: string; color: string; size: number; points: Point[] };
export type Role = 'admin' | 'editor' | 'viewer';
export type UserMeta = { socketId: string; userId: string; name: string; color: string; role: Role };
export type RoomState = { id: string; users: Record<string, UserMeta>; strokes: Stroke[]; locked: boolean };
