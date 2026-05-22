import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function RoleRedirect() {
  const { user } = useAuth();
  if (user?.role === 'candidate') {
    return <Navigate to="/student" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/recruiter" replace />;
}
