import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <main className="centered">
    <h1>404</h1>
    <Link to="/dashboard">Вернуться к документам</Link>
  </main>
);
