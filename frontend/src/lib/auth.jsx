import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { api, ApiError, configureApi } from './api';
import { tokenInfo } from './jwt';
import ReauthDialog from '../components/ReauthDialog.jsx';

const AuthContext = createContext(null);
const STORAGE_KEY = 'todo.token';

// sessionStorage: the token survives a reload but not a closed tab.
function readStored() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function writeStored(token) {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable, the session just won't survive a reload */
  }
}

function parseToken(value) {
  if (typeof value !== 'string' || !tokenInfo(value)) {
    throw new ApiError(500, "The server's sign-in response wasn't what this app expected.");
  }
  return value;
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = readStored();
    return stored && tokenInfo(stored) ? stored : null;
  });
  const tokenRef = useRef(token);
  const [flash, setFlash] = useState(null);
  const [reauthOpen, setReauthOpen] = useState(false);
  const pending = useRef(null); // { promise, resolve } while the sign-in dialog is open

  const info = useMemo(() => (token ? tokenInfo(token) : null), [token]);

  const setToken = useCallback((next) => {
    tokenRef.current = next;
    writeStored(next);
    setTokenState(next);
  }, []);

  const login = useCallback(
    async (userName, password) => {
      const next = parseToken(await api.login(userName, password));
      setToken(next);
      return next;
    },
    [setToken],
  );

  const finishReauth = useCallback((next) => {
    pending.current?.resolve(next);
    pending.current = null;
    setReauthOpen(false);
  }, []);

  const logout = useCallback(
    (notice = null) => {
      finishReauth(null);
      setToken(null);
      setFlash(notice);
    },
    [finishReauth, setToken],
  );

  // Resolves with a fresh token once the person signs in again, or null if they back out.
  // Concurrent callers share one dialog.
  const requestReauth = useCallback(() => {
    if (!tokenRef.current) return Promise.resolve(null);
    if (pending.current) return pending.current.promise;
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
    });
    pending.current = { promise, resolve };
    setReauthOpen(true);
    return promise;
  }, []);

  const submitReauth = useCallback(
    async (password) => {
      const username = tokenInfo(tokenRef.current)?.username;
      const next = parseToken(await api.login(username, password));
      setToken(next);
      finishReauth(next);
    },
    [finishReauth, setToken],
  );

  // Children's effects run before this component's effects, so the API client must be wired
  // up during the first render, before anything can make a request.
  const configured = useRef(false);
  if (!configured.current) {
    configureApi({ getToken: () => tokenRef.current, onReauth: requestReauth });
    configured.current = true;
  }

  const value = useMemo(
    () => ({
      token,
      username: info?.username ?? null,
      expiresAt: info?.expiresAt ?? null,
      flash,
      clearFlash: () => setFlash(null),
      login,
      logout,
      requestReauth,
      reauthOpen,
      submitReauth,
      cancelReauth: () => finishReauth(null),
    }),
    [token, info, flash, login, logout, requestReauth, reauthOpen, submitReauth, finishReauth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ReauthDialog />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
