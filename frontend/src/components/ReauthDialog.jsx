import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import Dialog from './Dialog.jsx';
import { FormError, TextField } from './Field.jsx';

// Sessions last 5 minutes. Instead of throwing people to the login page (and losing a draft),
// we ask for the password in place, then carry on with whatever they were doing.
function ReauthForm() {
  const { username, submitReauth, cancelReauth, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitReauth(password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-4">
      <p className="text-muted">
        Sign in as <strong className="text-ink">{username}</strong> to continue. Anything you were typing is kept.
      </p>
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormError>{error}</FormError>
      <div className="flex flex-wrap justify-end gap-3 pt-1">
        <button type="button" className="btn btn-quiet" onClick={() => logout('You signed out.')} disabled={busy}>
          Sign out
        </button>
        <button type="button" className="btn btn-quiet" onClick={cancelReauth} disabled={busy}>
          Not now
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}

export default function ReauthDialog() {
  const { reauthOpen, cancelReauth } = useAuth();
  return (
    <Dialog open={reauthOpen} onClose={cancelReauth} title="Your session ended">
      <ReauthForm />
    </Dialog>
  );
}
