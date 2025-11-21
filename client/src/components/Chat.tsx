import React, { useState } from 'react';
export default function Chat({ ws }: { ws: any }) {
  const [val, setVal] = useState('');
  const send = () => { if (!val.trim()) return; ws.send({ type: 'chat:message', payload: { message: val } }); setVal(''); };
  return (<div><div className="chat"></div><div style={{ display:'flex', gap:8 }}><input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Message" /><button onClick={send}>Send</button></div></div>);
}
