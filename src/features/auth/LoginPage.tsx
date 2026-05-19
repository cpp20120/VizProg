import { useState, type SyntheticEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { login } from '@features/auth/authSlice';

type LocationState = { from?: { pathname: string } };

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, authStatus, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [validation, setValidation] = useState<string | null>(null);

  if (accessToken) return <Navigate to="/dashboard" replace />;

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidation('Введите корректный email');
      return;
    }
    if (password.length < 8) {
      setValidation('Пароль должен быть минимум 8 символов');
      return;
    }
    setValidation(null);
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const state = location.state as LocationState | null;
      void navigate(state?.from?.pathname ?? '/dashboard', { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={(event) => void submit(event)}>
        <h1>Вход</h1>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {(validation ?? error) && <p className="form-error">{validation ?? error}</p>}
        <button disabled={authStatus === 'loading'}>Войти</button>
        <Link to="/register">Создать аккаунт</Link>
      </form>
    </main>
  );
};
