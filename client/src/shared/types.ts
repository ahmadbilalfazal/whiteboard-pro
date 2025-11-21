export type Point = { x: number; y: number; t: number };
export type Stroke = { id: string; userId: string; color: string; size: number; points: Point[] };
export type WSMessage = { type: string; payload: any };
