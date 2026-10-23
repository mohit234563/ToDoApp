import { useTheme } from '../lib/theme.jsx';
import { MoonIcon, SunIcon } from './Icons.jsx';
import Mark from './Mark.jsx';
import Numeral from './Numeral.jsx';

export default function AuthLayout({ title, lead, children, footer }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between gap-8 px-6 py-8 sm:px-12 lg:py-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <Mark size={26} />
            Todo
          </div>
          <button
            type="button"
            onClick={toggle}
            className="icon-btn"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="max-w-xl">
          <Numeral pct={62} stroke="3px" className="text-[9rem] sm:text-[14rem]">
            {new Date().getDate()}
          </Numeral>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-md text-base text-muted sm:text-lg">{lead}</p>
        </div>

        <span className="hidden lg:block" />
      </section>

      <section className="flex items-center justify-center bg-surface px-6 py-10 sm:px-12 lg:min-h-dvh">
        <div className="w-full max-w-md">
          {children}
          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </section>
    </div>
  );
}
