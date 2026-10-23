import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import {
  addDays,
  formatLong,
  fromKey,
  inlineLabel,
  relativeLabel,
  toKey,
  todayKey,
} from '../lib/dates';
import { useToast } from '../lib/toast.jsx';
import { useTodos } from '../lib/todos.jsx';
import useTitle from '../lib/useTitle';
import AddTask from '../components/AddTask.jsx';
import { FormError, Notice } from '../components/Field.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons.jsx';
import Numeral from '../components/Numeral.jsx';
import TaskRow from '../components/TaskRow.jsx';
import WeekStrip, { pathFor } from '../components/WeekStrip.jsx';

function statusText({ loading, total, done, past }) {
  if (loading) return 'Loading your tasks…';
  if (total === 0) return past ? 'Nothing was planned.' : 'Nothing planned yet.';
  if (done === total) return total === 1 ? 'Done.' : `All ${total} done.`;
  if (past) return `${done} of ${total} done, ${total - done} unfinished.`;
  return `${done} of ${total} done.`;
}

export default function Day() {
  const { date } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { todos, status, error, reload, patch } = useTodos();
  const [, setTick] = useState(0);
  const [pending, setPending] = useState(() => new Set());

  // So "today" moves on if the tab is left open past midnight.
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const today = todayKey();
  const selected = date ?? today;
  const selDate = fromKey(selected);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const t of todos) {
      if (!t.day) continue;
      const entry = map.get(t.day) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (t.done) entry.done += 1;
      map.set(t.day, entry);
    }
    return map;
  }, [todos]);

  const dayTodos = useMemo(() => todos.filter((t) => t.day === selected), [todos, selected]);

  useTitle(selDate ? relativeLabel(selected, today) : 'Planner');
  if (!selDate) return <Navigate to="/" replace />;

  const past = selected < today;
  const loading = status === 'loading';
  const total = dayTodos.length;
  const done = dayTodos.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const missingIds = dayTodos.some((t) => !t.id);
  const goTo = (key) => navigate(pathFor(key, today));

  async function toggle(todo) {
    if (!todo.id || pending.has(todo.id)) return;
    setPending((s) => new Set(s).add(todo.id));
    patch(todo.id, { done: !todo.done }); // optimistic, undone below if the server refuses
    try {
      await api.toggleTodo(todo.id);
    } catch (err) {
      patch(todo.id, { done: todo.done });
      toast(err.message, 'error');
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(todo.id);
        return next;
      });
    }
  }

  async function add(content) {
    try {
      await api.addTodo(selected, content);
      await reload({ quiet: true });
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    }
  }

  async function save(todo, content) {
    try {
      await api.editTodo(todo.id, content);
      patch(todo.id, { content });
      reload({ quiet: true });
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    }
  }

  async function remove(todo) {
    try {
      await api.deleteTodo(todo.id);
      await reload({ quiet: true });
      toast('Task deleted.');
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-end gap-5 lg:block">
          <Numeral pct={pct} className="text-[6.5rem] lg:text-[11rem]">
            {selDate.getDate()}
          </Numeral>
          <div className="pb-1 lg:mt-6">
            <h1 className="text-3xl font-bold tracking-tight">{relativeLabel(selected, today)}</h1>
            <p className="text-muted">{formatLong(selDate)}</p>
          </div>
        </div>

        <p role="status" className="mt-5 text-lg">
          {statusText({ loading, total, done, past })}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to={pathFor(toKey(addDays(selDate, -1)), today)} className="icon-btn border border-line" aria-label="Previous day">
            <ChevronLeftIcon />
          </Link>
          <Link to={pathFor(toKey(addDays(selDate, 1)), today)} className="icon-btn border border-line" aria-label="Next day">
            <ChevronRightIcon />
          </Link>
          {selected !== today && (
            <Link to="/" className="btn btn-quiet btn-small">
              Back to today
            </Link>
          )}
          <label htmlFor="jump-date" className="sr-only">
            Jump to a date
          </label>
          <input
            id="jump-date"
            type="date"
            className="input w-auto py-1.5 text-sm"
            value={selected}
            onChange={(e) => fromKey(e.target.value) && goTo(e.target.value)}
          />
        </div>
      </aside>

      <section className="min-w-0 space-y-6" aria-label="Tasks">
        <WeekStrip selected={selected} today={today} byDay={byDay} />

        {past ? (
          <Notice>This day is in the past, so tasks can't be added, edited or deleted. You can still tick them off.</Notice>
        ) : (
          <AddTask key={selected} label={inlineLabel(selected, today)} onAdd={add} />
        )}

        {missingIds && (
          <Notice>
            The server sent task IDs in a format this app can't read, so ticking, editing and deleting are off. This usually
            means the backend is an older build: it needs the idHex getter in Todo.java.
          </Notice>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <FormError>{error}</FormError>
            <button type="button" className="btn btn-quiet" onClick={() => reload()}>
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        )}

        {status === 'ready' && total === 0 && (
          <div className="rounded-3xl border border-dashed border-line px-6 py-12 text-center">
            <p className="text-xl font-semibold">{past ? 'Nothing was planned for this day' : `Nothing planned for ${inlineLabel(selected, today)}`}</p>
            {!past && <p className="mx-auto mt-2 max-w-sm text-muted">Type a task above to start the day. The date fills in as you finish them.</p>}
          </div>
        )}

        {total > 0 && (
          <ul className="-mx-3 space-y-1">
            {dayTodos.map((todo) => (
              <li key={todo.key}>
                <TaskRow
                  todo={todo}
                  canEdit={!past && Boolean(todo.id)}
                  canToggle={Boolean(todo.id)}
                  busy={todo.id ? pending.has(todo.id) : false}
                  onToggle={toggle}
                  onSave={save}
                  onDelete={remove}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
