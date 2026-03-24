import React, { useState } from 'react';
import BookFetcher from './components/BookFetcher';
import BookList from './components/BookList/BookList';
import { Book } from './types/types';
import './App.css';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div>
      <BookFetcher onBooksLoaded={setBooks} onLoading={setLoading} />
      {loading ? <p>Loading...</p> : <BookList books={books} />}
    </div>
  );
};

export default App;
