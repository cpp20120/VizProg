import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { logout } from '@features/auth/authSlice';
import { NotificationCenter } from '@features/ui/NotificationCenter';

export const AppLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const activeDocument = useAppSelector((state) => state.documents.activeDocument);

  const signOut = async () => {
    await dispatch(logout());
    void navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <strong>Spreadsheet</strong>
        <NavLink to="/dashboard">Мои документы</NavLink>
        <NavLink to="/profile">Профиль</NavLink>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">Мои документы{activeDocument ? ` / ${activeDocument.name}` : ''}</div>
          <div className="user-menu">
            <span>{user?.name}</span>
            <button onClick={() => void signOut()}>Выйти</button>
          </div>
        </header>
        <Outlet />
        <NotificationCenter />
      </div>
    </div>
  );
};
