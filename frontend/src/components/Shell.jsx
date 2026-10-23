import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { useTheme } from '../lib/theme.jsx';
import { MoonIcon, SunIcon } from './Icons.jsx';
import Mark from './Mark.jsx';

const navLink = 'rounded-md py-1 text-[0.95rem] text-muted transition-colors hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink';

function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

// Quiet until the last minute of the 5-minute session, then offers to extend it.
function SessionNotice() {
  const { expiresAt, requestReauth } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!expiresAt) return null;
  const left = expiresAt - now;
  if (left > 60_000) return null;

  return (
    <div className="bg-ink text-on-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
        <span className="sr-only" role="status">
          {left <= 0 ? 'Your session ended.' : 'Your session ends in less than a minute.'}
        </span>
        <span aria-hidden="true">{left <= 0 ? 'Your session ended.' : `Your session ends in ${formatCountdown(left)}.`}</span>
        <button type="button" onClick={requestReauth} className="font-semibold underline underline-offset-4">
          Stay signed in
        </button>
      </div>
    </div>
  );
}

export default function Shell({ children }) {
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const onPlanner = pathname === '/' || pathname.startsWith('/day/');

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-x-4 px-4 py-3 sm:gap-x-6 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight sm:gap-2.5">
            <Mark size={24} />
            Todo
          </Link>

          <nav aria-label="Main" className="flex items-center gap-4 sm:gap-5">
            <Link to="/" aria-current={onPlanner ? 'page' : undefined} className={navLink}>
              Planner
            </Link>
            <Link to="/account" aria-current={pathname === '/account' ? 'page' : undefined} className={navLink}>
              Account
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="icon-btn"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button type="button" onClick={() => logout('You signed out.')} className="btn btn-quiet btn-small">
              Sign out
            </button>
          </div>
        </div>
        <SessionNotice />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
