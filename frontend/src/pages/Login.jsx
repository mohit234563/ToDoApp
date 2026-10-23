import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import useTitle from '../lib/useTitle';
import AuthLayout from '../components/AuthLayout.jsx';
import { FormError, Notice, TextField } from '../components/Field.jsx';

export default function Login() {
  useTitle('Sign in');
  const { token, login, flash, clearFlash } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to={location.state?.from ?? '/'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    clearFlash();
    try {
      await login(userName.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Plan the day. Tick it off."
      lead="Add tasks to a day, check them off, and watch the date fill in."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Sign in</h2>
      <form onSubmit={submit} className="space-y-4">
        <Notice>{flash}</Notice>
        <TextField
          label="Username"
          autoComplete="username"
          autoFocus
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormError>{error}</FormError>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
