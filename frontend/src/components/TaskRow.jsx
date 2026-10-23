import { useEffect, useRef, useState } from 'react';
import { PencilIcon, TrashIcon } from './Icons.jsx';

function Tick({ checked, onChange, disabled, label }) {
  return (
    <label className="tick -m-2 inline-flex cursor-pointer p-2">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />
      <span className="tick-box grid size-7 place-items-center rounded-full border-2 border-muted/60 transition-colors">
        <svg className="tick-mark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-on-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </label>
  );
}

// One task. Past days are read-only, except that tasks can still be ticked off, because
// the server allows that. `canEdit` is false for past days and for tasks without a usable id.
export default function TaskRow({ todo, canEdit, canToggle, busy, onToggle, onSave, onDelete }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'delete'
  const [draft, setDraft] = useState(todo.content);
  const [working, setWorking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === 'edit') inputRef.current?.select();
  }, [mode]);

  function startEdit() {
    setDraft(todo.content);
    setMode('edit');
  }

  async function save(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (text === todo.content) {
      setMode('view');
      return;
    }
    setWorking(true);
    const ok = await onSave(todo, text);
    setWorking(false);
    if (ok) setMode('view');
  }

  async function remove() {
    setWorking(true);
    const ok = await onDelete(todo);
    if (!ok) {
      setWorking(false);
      setMode('view');
    }
  }

  if (mode === 'edit') {
    return (
      <form onSubmit={save} className="flex items-center gap-2 rounded-2xl bg-raised px-3 py-3">
        <label htmlFor={`edit-${todo.key}`} className="sr-only">
          Edit task
        </label>
        <input
          id={`edit-${todo.key}`}
          ref={inputRef}
          className="input py-2"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setMode('view')}
        />
        <button type="submit" className="btn btn-primary btn-small" disabled={working || !draft.trim()}>
          {working ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn btn-quiet btn-small" onClick={() => setMode('view')} disabled={working}>
          Cancel
        </button>
      </form>
    );
  }

  if (mode === 'delete') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/50 bg-danger/10 px-4 py-3" role="group" aria-label="Confirm delete">
        <p className="min-w-0 break-words text-sm">
          Delete “<span className="font-semibold">{todo.content}</span>”? This can't be undone.
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-danger-solid btn-small" onClick={remove} disabled={working} autoFocus>
            {working ? 'Deleting…' : 'Delete'}
          </button>
          <button type="button" className="btn btn-quiet btn-small" onClick={() => setMode('view')} disabled={working}>
            Keep
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-raised/70">
      <div className="pt-0.5">
        <Tick
          checked={todo.done}
          disabled={!canToggle || busy}
          onChange={() => onToggle(todo)}
          label={`${todo.done ? 'Mark not done' : 'Mark done'}: ${todo.content}`}
        />
      </div>
      <p className={`min-w-0 flex-1 break-words pt-1 text-[1.05rem] transition-colors ${todo.done ? 'text-muted line-through decoration-muted/60' : ''}`}>
        {todo.content}
      </p>
      {canEdit && (
        <div className="flex shrink-0 gap-0.5">
          <button type="button" className="icon-btn" onClick={startEdit} aria-label={`Edit: ${todo.content}`}>
            <PencilIcon />
          </button>
          <button type="button" className="icon-btn" onClick={() => setMode('delete')} aria-label={`Delete: ${todo.content}`}>
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}
