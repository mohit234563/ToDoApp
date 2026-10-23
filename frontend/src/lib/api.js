import { isExpired } from './jwt';

// In development, calls go to /api/*, which Vite forwards to the Spring Boot server (see
// vite.config.js). When the built frontend is packaged into the Spring app (`npm run build:spring`),
// it is served from the same address as the API, so there is no prefix (see .env.spring).
const BASE = import.meta.env.VITE_API_BASE ?? '/api';

let getToken = () => null;
let onReauth = async () => null;

export function configureApi(config) {
  getToken = config.getToken;
  onReauth = config.onReauth;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const SESSION_ENDED = 'Your session ended. Sign in again to continue.';

// `body` is sent as JSON. `raw` is sent as plain text: the edit endpoint reads its body as a bare
// String, so JSON-encoding it would store the surrounding quotes as part of the task.
async function send(path, { method = 'GET', body, raw, token } = {}) {
  const headers = { Accept: 'application/json, text/plain, */*' };
  let payload;
  if (raw !== undefined) {
    headers['Content-Type'] = 'text/plain;charset=UTF-8';
    payload = raw;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that the backend is running.");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text; // the login endpoint returns a bare token string, not JSON
    }
  }
  return { status: res.status, ok: res.ok, data };
}

function messageFor(status, data, messages) {
  if (messages?.[status]) return messages[status];
  if (typeof data === 'string' && data.length > 0 && data.length < 160 && !data.trim().startsWith('<')) {
    return data;
  }
  if (status === 400) return 'The server rejected that request. Check the details and try again.';
  if (status === 401 || status === 403) return "You don't have permission to do that.";
  if (status === 404) return "That wasn't found. It may have been deleted.";
  if (status >= 500) return 'The server hit an error. Try again in a moment.';
  return `Something went wrong (status ${status}).`;
}

// Tokens last 5 minutes and there is no refresh endpoint. When a token is missing, expired or
// refused we ask for the password in a dialog (not a redirect), then retry the request, so
// whatever the person was doing stays on screen.
function shouldReauth(status, token) {
  if (status === 401 || status === 403) return true;
  if (status === 500) return isExpired(token, 0); // an expired token makes the JWT filter throw
  return false;
}

export async function request(path, opts = {}) {
  const { auth = true, messages } = opts;

  let token = null;
  if (auth) {
    token = getToken();
    if (!token || isExpired(token)) {
      token = await onReauth();
      if (!token) throw new ApiError(401, SESSION_ENDED);
    }
  }

  let res = await send(path, { ...opts, token });

  if (auth && shouldReauth(res.status, token)) {
    const fresh = await onReauth();
    if (!fresh) throw new ApiError(401, SESSION_ENDED);
    res = await send(path, { ...opts, token: fresh });
  }

  if (!res.ok) throw new ApiError(res.status, messageFor(res.status, res.data, messages));
  return res.data;
}

const id = encodeURIComponent;

export const api = {
  // public
  login: (userName, password) =>
    request('/public/login', { method: 'POST', body: { userName, password }, auth: false }),
  register: (body) =>
    request('/public/register-user', {
      method: 'POST',
      body,
      auth: false,
      messages: {
        400: 'Enter a username and a password.',
        409: 'That username is already taken. Try another.',
      },
    }),

  // profile
  me: () => request('/User/get-user'),
  updateMe: (body) =>
    request('/User/editUser', {
      method: 'PUT',
      body,
      messages: { 400: "Couldn't save your profile. That username may already be taken." },
    }),

  // tasks. `date` is always YYYY-MM-DD.
  todos: async () => {
    const data = await request('/todos/getAllTodo');
    return Array.isArray(data) ? data : [];
  },
  addTodo: (date, content) =>
    request(`/todos/addTodo?date=${id(date)}`, {
      method: 'POST',
      body: { content },
      messages: { 400: "Couldn't add that task. Add some text, and use today or a later day." },
    }),
  editTodo: (todoId, content) =>
    request(`/todos/editTodo/${id(todoId)}`, {
      method: 'PUT',
      raw: content,
      messages: {
        400: "Couldn't save that change. The text can't be empty, and tasks on past days can't be edited.",
        404: 'That task was deleted or no longer exists.',
      },
    }),
  // The server flips the state (done to not done and back); it does not take a value.
  toggleTodo: (todoId) =>
    request(`/todos/markTodo/${id(todoId)}`, {
      method: 'POST',
      messages: { 404: 'That task was deleted or no longer exists.' },
    }),
  deleteTodo: (todoId) =>
    request(`/todos/deleteTodo/${id(todoId)}`, {
      method: 'DELETE',
      messages: {
        400: "Past tasks can't be deleted.",
        404: 'That task was already deleted.',
      },
    }),
};
