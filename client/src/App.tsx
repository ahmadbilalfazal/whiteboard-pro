import React, { useEffect, useState } from 'react';
import { WSClient } from './ws/wsClient';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Chat from './components/Chat';
import Presence from './components/Presence';
import { useStore } from './store/store';
const WS_URL = (import.meta.env.VITE_WS_URL) || 'ws://localhost:3000';
export default function App() {
  const [ws] = useState(() => new WSClient(WS_URL + '/ws'));
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    ws.connect('roomId=demo&userId=web&name=Guest');
    ws.onMsg = (m) => {
      if (m.type === 'room:state') {
        setUsers(m.payload.users || []);
        useStore.getState().replaceStrokes(m.payload.strokes || []);
      }
      if (m.type === 'presence') {
        setUsers(m.payload.users || []);
      }
      if (m.type === 'strokes:replace') {
        useStore.getState().replaceStrokes(m.payload.strokes || []);
      }
    };
  }, []);
  function handleClear() { ws.send({ type: 'board:clear', payload: {} }); }
  function handleUndo() { ws.send({ type: 'stroke:undo', payload: {} }); }
  function handleSave() { ws.send({ type: 'room:save', payload: {} }); }
  return (<div className="app"><div className="sidebar"><Toolbar onClear={handleClear} onUndo={handleUndo} onSave={handleSave} /><Presence users={users} /><Chat ws={ws} /></div><Canvas ws={ws} /></div>);
}
