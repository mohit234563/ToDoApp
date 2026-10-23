import { useEffect, useId, useRef } from 'react';

// Built on the native <dialog>, which brings focus trapping, Escape to close and the backdrop.
// Children are only mounted while open, so forms inside start fresh each time.
export default function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl border border-line bg-raised p-0 text-ink shadow-2xl"
    >
      {open && (
        <div className="p-6 sm:p-7">
          <h2 id={titleId} className="text-xl font-bold tracking-tight">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  busy = false,
  danger = false,
  confirmDisabled = false,
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="mt-2 space-y-4 text-muted">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={busy || confirmDisabled}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
