import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  const [isValid, setIsValid] = useState<boolean | null>(token ? null : false);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    let isMounted = true;
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        if (isMounted) setIsValid(true);
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_username');
          setIsValid(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname, token]);

  if (!token || isValid === false) {
    return <Navigate to="/login?expired=1" state={{ from: location }} replace />;
  }

  if (isValid === null) {
    return null;
  }

  return <>{children}</>;
};
