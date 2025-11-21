import React from 'react';
export default function Toolbar({ onClear, onUndo, onSave }: { onClear: () => void; onUndo: () => void; onSave: () => void }) {
  return (<div className="toolbar"><button onClick={onUndo}>Undo</button><button onClick={onClear}>Clear</button><button onClick={onSave}>Save</button></div>);
}
