import React, { useEffect, useState, useMemo } from 'react';
import BookCard from '../BookCards/BookCards';
import { Book } from '../../types/types';
import styles from './BookList.module.css';
import { fetchBookCover } from '../../utils/FetchBookCover';

interface BookListProps {
  books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'title' | 'authors'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBooks(books);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const newFilteredBooks = books.filter((book) => {
      const title = book.title?.toLowerCase() || '';
      const authors = book.authors?.join(' ').toLowerCase() || '';
      const isbn = book.isbn?.toLowerCase() || '';
      return (
        title.startsWith(lowerSearch) ||
        authors.startsWith(lowerSearch) ||
        isbn.startsWith(lowerSearch) ||
        title.includes(lowerSearch) ||
        authors.includes(lowerSearch) ||
        isbn.includes(lowerSearch)
      );
    });

    setFilteredBooks(newFilteredBooks);
  }, [searchTerm, books]);

  useEffect(() => {
    const fetchCovers = async () => {
      const newCovers: Record<string, string> = {};
      for (const book of books) {
        if (!coverCache[book.isbn]) {
          const coverUrl = await fetchBookCover(book.isbn);
          newCovers[book.isbn] = coverUrl || '';
        }
      }
      setCoverCache((prev) => ({ ...prev, ...newCovers }));
    };

    fetchCovers();
  }, [books]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      const valueA = sortField === 'title' ? a.title : a.authors?.[0] || '';
      const valueB = sortField === 'title' ? b.title : b.authors?.[0] || '';
      return sortOrder === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }, [filteredBooks, sortField, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for a book..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.sortOptions}>
          <label>Sort by:</label>
          <select
            value={sortField}
            onChange={(e) =>
              setSortField(e.target.value as 'title' | 'authors')
            }
            className={styles.select}
          >
            <option value="title">Title</option>
            <option value="authors">Author</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className={styles.select}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {sortedBooks.map((book, index) => (
          <BookCard
            key={`${book.isbn}-${index}`}
            title={book.title}
            authors={book.authors}
            isbn={book.isbn}
            coverUrl={coverCache[book.isbn] || ''}
          />
        ))}
      </div>
    </div>
  );
};

export default BookList;
