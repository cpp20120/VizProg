import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { register } from '@features/auth/authSlice';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector((state) => state.auth.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) setValidation('Введите имя');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setValidation('Введите корректный email');
    else if (password.length < 8) setValidation('Пароль должен быть минимум 8 символов');
    else if (password !== confirmPassword) setValidation('Пароли не совпадают');
    else {
      setValidation(null);
      const result = await dispatch(register({ name, email, password }));
      if (register.fulfilled.match(result)) void navigate('/dashboard', { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={(event) => void submit(event)}>
        <h1>Регистрация</h1>
        <label>
          Имя
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label>
          Подтверждение
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </label>
        {(validation ?? error) && <p className="form-error">{validation ?? error}</p>}
        <button>Зарегистрироваться</button>
        <Link to="/login">Уже есть аккаунт</Link>
      </form>
    </main>
  );
};
