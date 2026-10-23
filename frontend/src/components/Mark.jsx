// The logo is a ring that is half full, the same idea as the date numeral filling up.
export default function Mark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3.5 16a12.5 12.5 0 0 0 25 0z" fill="var(--c-done)" />
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="var(--c-ink)" strokeWidth="3" />
    </svg>
  );
}
