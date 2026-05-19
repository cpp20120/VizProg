import { useState, type SyntheticEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { changePassword, updateProfile } from '@features/auth/authSlice';
import { fetchDocuments } from '@features/documents/documentsSlice';
import { formatDateTime } from '@shared/utils/date';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const documents = useAppSelector((state) => state.documents.documents);
  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');

  const saveName = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim()) await dispatch(updateProfile(name));
  };

  const savePassword = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length >= 8) {
      await dispatch(changePassword(password));
      setPassword('');
    }
  };

  return (
    <main className="page narrow" onMouseEnter={() => void dispatch(fetchDocuments())}>
      <h1>Профиль</h1>
      <dl className="profile-stats">
        <dt>Email</dt>
        <dd>{user?.email}</dd>
        <dt>Дата регистрации</dt>
        <dd>{user ? formatDateTime(user.createdAt) : ''}</dd>
        <dt>Документы</dt>
        <dd>{documents.length}</dd>
      </dl>
      <form className="panel" onSubmit={(event) => void saveName(event)}>
        <label>
          Имя
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button>Сохранить имя</button>
      </form>
      <form className="panel" onSubmit={(event) => void savePassword(event)}>
        <label>
          Новый пароль
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button disabled={password.length < 8}>Сменить пароль</button>
      </form>
    </main>
  );
};
