// Days are handled as "YYYY-MM-DD" keys in the person's local time, the same shape the server uses
// for its LocalDate. Keys compare correctly as plain strings.
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => toKey(new Date());

export function fromKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key ?? '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return toKey(d) === key ? d : null; // rejects 2026-02-31 and the like
}

// The server sends a LocalDate as "2026-10-19", but arrays and full timestamps are handled too.
export function dayKey(value) {
  if (!value) return null;
  if (Array.isArray(value)) return `${value[0]}-${pad(value[1])}-${pad(value[2])}`;
  if (typeof value === 'string') return value.slice(0, 10);
  return null;
}

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function dayDiff(aKey, bKey) {
  return Math.round((fromKey(aKey) - fromKey(bKey)) / 86_400_000);
}

// Monday to Sunday of the week containing `d`.
export function weekOf(d) {
  const offset = (d.getDay() + 6) % 7;
  const monday = addDays(d, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const weekdayShort = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const weekdayLong = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const monthDay = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' });
const monthDayYear = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const shortMonthDay = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export const formatWeekdayShort = (d) => weekdayShort.format(d);
export const formatWeekdayLong = (d) => weekdayLong.format(d);
export const formatShort = (d) => shortMonthDay.format(d);

export function formatLong(d) {
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `${weekdayLong.format(d)}, ${(sameYear ? monthDay : monthDayYear).format(d)}`;
}

// "Today", "Tomorrow", "Yesterday", otherwise the weekday name.
export function relativeLabel(key, today) {
  const diff = dayDiff(key, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return weekdayLong.format(fromKey(key));
}

// Lower-case form for sentences: "today", "tomorrow", "yesterday", else "Wed, Oct 21".
export function inlineLabel(key, today) {
  const diff = dayDiff(key, today);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  return shortMonthDay.format(fromKey(key));
}
