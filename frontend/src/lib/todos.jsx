import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { dayKey } from './dates';

// Spring serialises a MongoDB ObjectId as an object with no usable id inside it.
// The backend's Todo.getIdHex() adds `idHex`, a plain string. A plain string `id` (or
// {"$oid": "..."}) works too.
export function todoId(raw) {
  if (!raw) return null;
  if (typeof raw.idHex === 'string' && raw.idHex) return raw.idHex;
  const id = raw.id;
  if (typeof id === 'string' && id) return id;
  if (id && typeof id.$oid === 'string') return id.$oid;
  return null;
}

export function normalizeTodo(raw, index) {
  const id = todoId(raw);
  return {
    id,
    key: id ?? `row-${index}`,
    content: raw.content ?? '',
    day: dayKey(raw.date),
    done: raw.completed === true,
  };
}

const TodosContext = createContext(null);

export function TodosProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', todos: [], error: null });

  // `quiet` refreshes in the background without clearing what is on screen.
  const reload = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setState((s) => ({ ...s, status: s.todos.length ? 'ready' : 'loading', error: null }));
    try {
      const list = await api.todos();
      setState({ status: 'ready', todos: list.map(normalizeTodo), error: null });
    } catch (err) {
      setState((s) => (quiet && s.status === 'ready' ? s : { ...s, status: 'error', error: err.message }));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Used for optimistic updates: change one task in place, without a round trip.
  const patch = useCallback((id, changes) => {
    setState((s) => ({ ...s, todos: s.todos.map((t) => (t.id === id ? { ...t, ...changes } : t)) }));
  }, []);

  const value = useMemo(() => ({ ...state, reload, patch }), [state, reload, patch]);
  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

export const useTodos = () => useContext(TodosContext);
