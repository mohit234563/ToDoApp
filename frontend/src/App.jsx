import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import { ThemeProvider } from './lib/theme.jsx';
import { ToastProvider } from './lib/toast.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Account from './pages/Account.jsx';
import Day from './pages/Day.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted">That address doesn't lead anywhere.</p>
        <Link to="/" className="btn btn-primary mt-6">
          Go to today
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<RequireAuth />}>
                <Route index element={<Day />} />
                <Route path="day/:date" element={<Day />} />
                <Route path="account" element={<Account />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
