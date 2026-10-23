import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { TodosProvider } from '../lib/todos.jsx';
import Shell from './Shell.jsx';

export default function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <TodosProvider>
      <Shell>
        <Outlet />
      </Shell>
    </TodosProvider>
  );
}
