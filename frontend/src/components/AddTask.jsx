import { useState } from 'react';
import { PlusIcon } from './Icons.jsx';

export default function AddTask({ label, onAdd }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    const ok = await onAdd(content);
    setBusy(false);
    if (ok) setText('');
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <label htmlFor="new-task" className="sr-only">
        New task for {label}
      </label>
      <input
        id="new-task"
        className="input"
        placeholder={`Add a task for ${label}`}
        value={text}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-primary shrink-0" disabled={busy || !text.trim()}>
        <PlusIcon />
        {busy ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
