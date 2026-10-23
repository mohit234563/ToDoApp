import { Link } from 'react-router-dom';
import { addDays, formatLong, formatWeekdayShort, fromKey, toKey, weekOf } from '../lib/dates';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

export const pathFor = (key, today) => (key === today ? '/' : `/day/${key}`);

function DayBar({ stats, selected, past }) {
  if (!stats || stats.total === 0) return <span className="mt-1 block h-1 w-8" aria-hidden="true" />;
  const pct = Math.round((stats.done / stats.total) * 100);
  const leftover = past && stats.done < stats.total;
  const track = selected
    ? 'color-mix(in srgb, var(--c-on-ink) 25%, transparent)'
    : leftover
      ? 'color-mix(in srgb, var(--c-late) 55%, transparent)'
      : 'var(--c-line)';
  const fill = selected ? 'var(--c-on-ink)' : 'var(--c-done)';
  return (
    <span className="mt-1 block h-1 w-8 overflow-hidden rounded-full" style={{ background: track }} aria-hidden="true">
      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
    </span>
  );
}

// One week, Monday to Sunday. The bar under each date shows how much of that day is done; on a
// past day, an amber track means some tasks were left unfinished.
export default function WeekStrip({ selected, today, byDay }) {
  const selDate = fromKey(selected);
  const days = weekOf(selDate);

  return (
    <nav aria-label="Week" className="flex items-center gap-1">
      <Link
        to={pathFor(toKey(addDays(selDate, -7)), today)}
        className="icon-btn"
        aria-label="Previous week"
      >
        <ChevronLeftIcon />
      </Link>

      <ul className="grid flex-1 grid-cols-7 gap-1">
        {days.map((d) => {
          const key = toKey(d);
          const stats = byDay.get(key);
          const isSelected = key === selected;
          const past = key < today;
          const summary = stats?.total ? `${stats.done} of ${stats.total} done` : 'no tasks';
          return (
            <li key={key}>
              <Link
                to={pathFor(key, today)}
                aria-current={isSelected ? 'page' : undefined}
                aria-label={`${formatLong(d)}, ${summary}`}
                className={`flex flex-col items-center rounded-2xl px-1 py-2.5 transition-colors ${
                  isSelected ? 'bg-ink text-on-ink' : 'hover:bg-raised'
                } ${key === today && !isSelected ? 'ring-1 ring-ink/40' : ''}`}
              >
                <span className={`text-sm ${isSelected ? 'text-on-ink/80' : 'text-muted'}`}>{formatWeekdayShort(d)}</span>
                <span className="font-display text-3xl font-bold leading-none tabular-nums">{d.getDate()}</span>
                <DayBar stats={stats} selected={isSelected} past={past} />
              </Link>
            </li>
          );
        })}
      </ul>

      <Link to={pathFor(toKey(addDays(selDate, 7)), today)} className="icon-btn" aria-label="Next week">
        <ChevronRightIcon />
      </Link>
    </nav>
  );
}
