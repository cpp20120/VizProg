import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { refreshSession } from '@features/auth/authSlice';

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { authStatus, accessToken, refreshToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken && refreshToken && authStatus === 'idle') void dispatch(refreshSession());
  }, [accessToken, authStatus, dispatch, refreshToken]);

  if (!accessToken && authStatus === 'loading') return <div className="centered">Загрузка сессии...</div>;
  if (!accessToken && !refreshToken) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!accessToken && authStatus !== 'authenticated') return <div className="centered">Проверка доступа...</div>;
  return <Outlet />;
};
