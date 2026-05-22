import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand text-ink">
        <p className="text-sm font-medium text-slate-600">Loading ResumeIQ...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
