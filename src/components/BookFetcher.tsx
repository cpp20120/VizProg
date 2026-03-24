import React, { useEffect } from 'react';
import { Book } from '../types/types';
import { fetchBookCover } from '../utils/FetchBookCover';

interface BookFetcherProps {
  onBooksLoaded: (books: Book[]) => void;
  onLoading: (loading: boolean) => void;
}

const BookFetcher: React.FC<BookFetcherProps> = ({
  onBooksLoaded,
  onLoading
}) => {
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        onLoading(true);
        const booksResponse = await fetch(
          'https://fakeapi.extendsclass.com/books'
        );
        const booksData: Book[] = await booksResponse.json();

        const booksWithCovers = await Promise.all(
          booksData.map(async (book) => {
            const cover = await fetchBookCover(book.isbn);
            return { ...book, cover };
          })
        );

        onBooksLoaded(booksWithCovers);
        localStorage.setItem('books', JSON.stringify(booksWithCovers));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        onLoading(false);
      }
    };

    const cachedBooks = localStorage.getItem('books');
    if (cachedBooks) {
      onBooksLoaded(JSON.parse(cachedBooks));
      onLoading(false);
    } else {
      fetchBooks();
    }
  }, [onBooksLoaded, onLoading]);

  return null;
};

export default BookFetcher;
