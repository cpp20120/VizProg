import React, { useEffect, useState } from 'react';
import styles from './BookCards.module.css';
import { fetchBookCover } from '../../utils/FetchBookCover';

interface BookCardProps {
  title: string;
  authors: string[];
  isbn: string;
  coverUrl: string;
}

const BookCard: React.FC<BookCardProps> = ({
  title,
  authors,
  isbn,
  coverUrl
}) => {
  const [fetchedCoverUrl, setFetchedCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCover = async () => {
      const cover = await fetchBookCover(isbn);
      setFetchedCoverUrl(cover);
    };

    fetchCover();
  }, [isbn]);

  const fallbackCoverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  const finalCoverUrl = fetchedCoverUrl || coverUrl || fallbackCoverUrl;

  const formattedAuthors = authors.join(', ');

  return (
    <div className={styles.card}>
      <img
        onError={(e) => {
          e.currentTarget.src = fallbackCoverUrl;
        }}
        src={finalCoverUrl}
        alt={title}
        className="cover"
      />
      <h2 className="title">{title}</h2>
      <p className="authors">{formattedAuthors}</p>
    </div>
  );
};

export default BookCard;
