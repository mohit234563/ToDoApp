import { useEffect, useState } from 'react';

// A big outlined day number that fills from the bottom as `pct` rises. It starts empty and fills
// on mount, which is the only entrance animation in the app. The numeral is decorative; the
// progress is also written out in words wherever it is used.
export default function Numeral({ children, pct, className = '', stroke = '2px' }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <span aria-hidden="true" className={`numeral inline-block ${className}`} style={{ '--p': `${shown}%`, '--stroke': stroke }}>
      {children}
    </span>
  );
}
