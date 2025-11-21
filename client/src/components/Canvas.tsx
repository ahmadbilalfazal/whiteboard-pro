import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { Stroke, Point } from '../shared/types';
import { WSClient } from '../ws/wsClient';
import ShortUniqueId from 'short-uuid';
const uid = new ShortUniqueId();
export default function Canvas({ ws }: { ws: WSClient }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const strokes = useStore((s) => s.strokes);
  const addStroke = useStore((s) => s.addStroke);
  useEffect(() => { const c = canvasRef.current; if (!c) return; const resize = () => { c.width = Math.min(window.innerWidth - 380, 1200); c.height = Math.min(window.innerHeight - 120, 800); renderAll(); }; resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  useEffect(() => { renderAll(); }, [strokes]);
  function renderAll() {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return; ctx.clearRect(0,0,c.width,c.height); for (const s of strokes) drawStroke(ctx, s); if (currentStroke) drawStroke(ctx, currentStroke);
  }
  function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
    if (s.points.length === 0) return; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.beginPath(); ctx.moveTo(s.points[0].x, s.points[0].y); for (let i = 1; i < s.points.length; i++) { const p = s.points[i]; ctx.lineTo(p.x, p.y); } ctx.stroke();
  }
  function pointerPos(e: PointerEvent) { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: Date.now() }; }
  function handlePointerDown(e: React.PointerEvent) { const p = pointerPos(e.nativeEvent); const s: Stroke = { id: uid(), userId: 'u', color: '#111', size: 3, points: [p] }; setCurrentStroke(s); setIsDrawing(true); ws.send({ type: 'draw:start', payload: { strokeId: s.id, point: p } }); }
  function handlePointerMove(e: React.PointerEvent) { if (!isDrawing || !currentStroke) return; const p = pointerPos(e.nativeEvent); const s = { ...currentStroke, points: [...currentStroke.points, p] }; setCurrentStroke(s); ws.send({ type: 'draw:move', payload: { strokeId: s.id, points: [p] } }); }
  function handlePointerUp() { if (!isDrawing || !currentStroke) return; const s = currentStroke; addStroke(s); ws.send({ type: 'draw:end', payload: { stroke: s } }); setCurrentStroke(null); setIsDrawing(false); }
  useEffect(() => { ws.onMsg = (m) => { if (m.type === 'draw:end') { const s: Stroke = m.payload.stroke; addStroke(s); } if (m.type === 'strokes:replace') { const s = m.payload.strokes as Stroke[]; window.requestAnimationFrame(() => { addReplace(s); }); } }; function addReplace(s: Stroke[]) { const store = useStore.getState(); store.replaceStrokes(s); } }, [ws]);
  return (<div className="canvasWrap"><canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} style={{ borderRadius:8 }} /></div>);
}
