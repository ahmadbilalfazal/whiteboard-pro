import create from 'zustand';
import { Stroke } from '../shared/types';
type State = { strokes: Stroke[]; addStroke: (s: Stroke) => void; replaceStrokes: (s: Stroke[]) => void; undo: () => void; }
export const useStore = create<State>((set,get) => ({ strokes: [], addStroke: (s) => set((st) => ({ strokes: [...st.strokes, s] })), replaceStrokes: (s) => set(() => ({ strokes: s })), undo: () => set((st) => ({ strokes: st.strokes.slice(0, -1) })) }));
