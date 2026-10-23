import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';
import useTitle from '../lib/useTitle';
import AuthLayout from '../components/AuthLayout.jsx';
import { FormError, TextField } from '../components/Field.jsx';

export default function Signup() {
  useTitle('Create account');
  const { token, login } = useAuth();
  const [form, setForm] = useState({ userName: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const userName = form.userName.trim();
    try {
      await api.register({ userName, email: form.email.trim(), password: form.password });
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    try {
      await login(userName, form.password);
    } catch (err) {
      setError(`Your account was created, but signing in failed: ${err.message}`);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Start with today."
      lead="Create an account to plan your days and see each one fill up as you finish."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Create an account</h2>
      <form onSubmit={submit} className="space-y-4">
        <TextField label="Username" autoComplete="username" autoFocus required value={form.userName} onChange={set('userName')} />
        <TextField label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set('password')}
        />
        <FormError>{error}</FormError>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
