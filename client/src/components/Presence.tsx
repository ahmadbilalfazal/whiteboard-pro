import React from 'react';
export default function Presence({ users }: { users: any[] }) { return (<div className="presence">{users.map((u:any) => (<div key={u.userId} style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:12, height:12, borderRadius:6, background:u.color }}></div><div>{u.name}</div></div>))}</div>); }
