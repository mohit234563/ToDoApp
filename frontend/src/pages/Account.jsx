import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../lib/toast.jsx';
import useTitle from '../lib/useTitle';
import { FormError, TextField } from '../components/Field.jsx';

function ProfileForm({ initial }) {
  const { username, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ userName: initial.userName ?? username ?? '', email: initial.email ?? '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const userName = form.userName.trim();
    try {
      await api.updateMe({ userName, email: form.email.trim(), password: form.password });
      if (userName !== username) {
        // The session token is tied to the old username, so it has to be replaced.
        logout('Username updated. Sign in with your new username.');
        return;
      }
      setForm((f) => ({ ...f, password: '' }));
      toast('Profile saved.');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <TextField label="Username" autoComplete="username" required value={form.userName} onChange={set('userName')} />
      <TextField label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="Enter your current password to keep it, or a new one to change it."
        value={form.password}
        onChange={set('password')}
      />
      <FormError>{error}</FormError>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

export default function Account() {
  useTitle('Account');
  const { username } = useAuth();
  const [state, setState] = useState({ status: 'loading', me: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', me: null, error: null });
    try {
      const me = await api.me();
      setState({ status: 'ready', me: me && typeof me === 'object' ? me : {}, error: null });
    } catch (err) {
      setState({ status: 'error', me: null, error: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Account</h1>
        <p className="mt-2 text-muted">
          Signed in as <strong className="text-ink">{username}</strong>.
        </p>
      </header>

      {state.status === 'loading' && <div className="h-72 animate-pulse rounded-3xl bg-surface" aria-hidden="true" />}

      {state.status === 'error' && (
        <div className="space-y-3">
          <FormError>{state.error}</FormError>
          <button type="button" className="btn btn-quiet" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="mb-5 text-xl font-bold tracking-tight">
            Profile
          </h2>
          <ProfileForm initial={state.me} />
        </section>
      )}
    </div>
  );
}
