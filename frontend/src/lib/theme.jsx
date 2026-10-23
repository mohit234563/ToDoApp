import { createContext, useCallback, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

function current() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

// index.html sets the initial theme (saved choice, otherwise the system setting) before first paint.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(current);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('todo.theme', next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
