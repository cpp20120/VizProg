import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BookList from './BookList';
import { Book } from '../../types/types';
import { fetchBookCover } from '../../utils/FetchBookCover';

vi.mock('../../utils/FetchBookCover', () => ({
    fetchBookCover: vi.fn(),
}));

vi.mock('../BookCards/BookCards', () => ({
    default: ({ title, authors, isbn, coverUrl }: any) => (
        <div data-testid="book-card" data-isbn={isbn}>
            <h3>{title}</h3>
            <p>{authors?.join(', ') || ''}</p>
            {coverUrl && <img src={coverUrl} alt={title} />}
        </div>
    ),
}));

describe('BookList Component', () => {
    const mockBooks: Book[] = [
        {
            title: 'The Great Gatsby',
            authors: ['F. Scott Fitzgerald'],
            isbn: '9780141182636',
        },
        {
            title: 'To Kill a Mockingbird',
            authors: ['Harper Lee'],
            isbn: '9780061120084',
        },
        {
            title: '1984',
            authors: ['George Orwell'],
            isbn: '9780451524935',
        },
        {
            title: 'Pride and Prejudice',
            authors: ['Jane Austen'],
            isbn: '9780141439518',
        },
        {
            title: 'The Catcher in the Rye',
            authors: ['J.D. Salinger'],
            isbn: '9780316769488',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation for fetchBookCover
        (fetchBookCover as any).mockImplementation((isbn: string) => {
            return Promise.resolve(`https://covers.example.com/${isbn}.jpg`);
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Rendering', () => {
        it('should render all books when no search term is provided', () => {
            render(<BookList books={mockBooks} />);

            const bookCards = screen.getAllByTestId('book-card');
            expect(bookCards).toHaveLength(mockBooks.length);

            mockBooks.forEach((book) => {
                expect(screen.getByText(book.title)).toBeInTheDocument();
            });
        });

        it('should render empty state when books array is empty', () => {
            render(<BookList books={[]} />);

            const bookCards = screen.queryAllByTestId('book-card');
            expect(bookCards).toHaveLength(0);
        });

        it('should render search input and sort controls', () => {
            render(<BookList books={mockBooks} />);

            expect(screen.getByPlaceholderText('Search for a book...')).toBeInTheDocument();
            expect(screen.getByText('Sort by:')).toBeInTheDocument();
            expect(screen.getByText('Ascending')).toBeInTheDocument();
            expect(screen.getByText('Descending')).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('should filter books by title (starts with)', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'The' } });

            const bookCards = screen.getAllByTestId('book-card');
            expect(bookCards).toHaveLength(2);
            expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
            expect(screen.getByText('The Catcher in the Rye')).toBeInTheDocument();
        });

        it('should filter books by title (includes)', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'kill' } });

            const bookCards = screen.getAllByTestId('book-card');
            expect(bookCards).toHaveLength(1);
            expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
        });

        it('should filter books by author', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'Austen' } });

            const bookCards = screen.getAllByTestId('book-card');
            expect(bookCards).toHaveLength(1);
            expect(screen.getByText('Pride and Prejudice')).toBeInTheDocument();
        });

        it('should filter books by ISBN', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: '9780451524935' } });

            const bookCards = screen.getAllByTestId('book-card');
            expect(bookCards).toHaveLength(1);
            expect(screen.getByText('1984')).toBeInTheDocument();
        });

        it('should show no results when search term does not match any book', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'Nonexistent Book' } });

            const bookCards = screen.queryAllByTestId('book-card');
            expect(bookCards).toHaveLength(0);
        });

        it('should reset filter when search term is cleared', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: '1984' } });

            expect(screen.getAllByTestId('book-card')).toHaveLength(1);

            fireEvent.change(searchInput, { target: { value: '' } });

            expect(screen.getAllByTestId('book-card')).toHaveLength(mockBooks.length);
        });

        it('should be case insensitive when searching', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'great' } });

            expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();

            fireEvent.change(searchInput, { target: { value: 'GREAT' } });

            expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
        });
    });

    describe('Sort Functionality', () => {
        it('should sort books by title in ascending order by default', () => {
            render(<BookList books={mockBooks} />);

            const bookCards = screen.getAllByTestId('book-card');
            const titles = bookCards.map(card => card.querySelector('h3')?.textContent);

            expect(titles).toEqual([
                '1984',
                'Pride and Prejudice',
                'The Catcher in the Rye',
                'The Great Gatsby',
                'To Kill a Mockingbird',
            ]);
        });

        it('should sort books by title in descending order', () => {
            render(<BookList books={mockBooks} />);

            const sortOrderSelect = screen.getAllByRole('combobox')[1];
            fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

            const bookCards = screen.getAllByTestId('book-card');
            const titles = bookCards.map(card => card.querySelector('h3')?.textContent);

            expect(titles).toEqual([
                'To Kill a Mockingbird',
                'The Great Gatsby',
                'The Catcher in the Rye',
                'Pride and Prejudice',
                '1984',
            ]);
        });

        it('should sort books by author in ascending order', () => {
            render(<BookList books={mockBooks} />);

            const sortFieldSelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(sortFieldSelect, { target: { value: 'authors' } });

            const bookCards = screen.getAllByTestId('book-card');
            const authors = bookCards.map(card => card.querySelector('p')?.textContent);

            expect(authors).toEqual([
                'F. Scott Fitzgerald',
                'George Orwell',
                'Harper Lee',
                'J.D. Salinger',
                'Jane Austen',
            ]);
        });

        it('should sort books by author in descending order', () => {
            render(<BookList books={mockBooks} />);

            const sortFieldSelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(sortFieldSelect, { target: { value: 'authors' } });

            const sortOrderSelect = screen.getAllByRole('combobox')[1];
            fireEvent.change(sortOrderSelect, { target: { value: 'desc' } });

            const bookCards = screen.getAllByTestId('book-card');
            const authors = bookCards.map(card => card.querySelector('p')?.textContent);

            expect(authors).toEqual([
                'Jane Austen',
                'J.D. Salinger',
                'Harper Lee',
                'George Orwell',
                'F. Scott Fitzgerald',
            ]);
        });

        it('should maintain sort order when filtering', () => {
            render(<BookList books={mockBooks} />);

            const sortFieldSelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(sortFieldSelect, { target: { value: 'authors' } });

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'The' } });

            const bookCards = screen.getAllByTestId('book-card');
            const authors = bookCards.map(card => card.querySelector('p')?.textContent);

            expect(authors).toEqual([
                'F. Scott Fitzgerald',
                'J.D. Salinger',
            ]);
        });
    });

    describe('Book Cover Fetching', () => {
        it('should fetch book covers for all books', async () => {
            render(<BookList books={mockBooks} />);

            await waitFor(() => {
                expect(fetchBookCover).toHaveBeenCalledTimes(mockBooks.length);
                mockBooks.forEach((book) => {
                    expect(fetchBookCover).toHaveBeenCalledWith(book.isbn);
                });
            });
        });

        it('should not fetch covers for books that are already cached', async () => {
            const { rerender } = render(<BookList books={mockBooks} />);

            await waitFor(() => {
                expect(fetchBookCover).toHaveBeenCalledTimes(mockBooks.length);
            });

            vi.clearAllMocks();

            rerender(<BookList books={[...mockBooks]} />);

            await waitFor(() => {
                expect(fetchBookCover).not.toHaveBeenCalled();
            });
        });

        it('should handle empty cover URL from fetch', async () => {
            (fetchBookCover as any).mockResolvedValueOnce('');

            render(<BookList books={[mockBooks[0]]} />);

            await waitFor(() => {
                expect(fetchBookCover).toHaveBeenCalled();
            });

            const bookCard = screen.getByTestId('book-card');
            expect(bookCard).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle search with undefined book properties', () => {
            const booksWithUndefinedData: any[] = [
                { title: undefined, authors: undefined, isbn: undefined },
                ...mockBooks,
            ];
            render(<BookList books={booksWithUndefinedData as Book[]} />);
            
            const searchInput = screen.getByPlaceholderText('Search for a book...');
            fireEvent.change(searchInput, { target: { value: 'Some Term' } });
            
            expect(screen.queryAllByTestId('book-card')).toHaveLength(0);
        });

        it('should handle sorting by authors with undefined authorship', () => {
            const booksWithUndefinedData: any[] = [
                { title: 'Z', authors: undefined, isbn: '1' },
                { title: 'A', authors: ['Author'], isbn: '2' },
                { title: 'B', authors: [], isbn: '3' },
                { title: 'C', authors: undefined, isbn: '4' },
            ];
            render(<BookList books={booksWithUndefinedData as Book[]} />);
            const sortFieldSelect = screen.getAllByRole('combobox')[0];
            fireEvent.change(sortFieldSelect, { target: { value: 'authors' } });

            const bookCards = screen.getAllByTestId('book-card');
            const titles = bookCards.map(card => card.querySelector('h3')?.textContent);
            expect(titles).toEqual(['Z', 'B', 'C', 'A']);
        });

        it('should handle books with missing title', () => {
            const booksWithMissingData: Book[] = [
                {
                    title: '',
                    authors: ['Unknown Author'],
                    isbn: '1234567890',
                },
                ...mockBooks,
            ];

            expect(() => {
                render(<BookList books={booksWithMissingData} />);
            }).not.toThrow();

            expect(screen.getAllByTestId('book-card')).toHaveLength(booksWithMissingData.length);
        });

        it('should handle books with missing authors', () => {
            const booksWithMissingData: Book[] = [
                {
                    title: 'Book Without Author',
                    authors: [],
                    isbn: '1234567890',
                },
                ...mockBooks,
            ];

            expect(() => {
                render(<BookList books={booksWithMissingData} />);
            }).not.toThrow();

            expect(screen.getAllByTestId('book-card')).toHaveLength(booksWithMissingData.length);
        });

        it('should handle books with missing ISBN', () => {
            const booksWithMissingData: Book[] = [
                {
                    title: 'Book Without ISBN',
                    authors: ['Author'],
                    isbn: '',
                },
                ...mockBooks,
            ];

            expect(() => {
                render(<BookList books={booksWithMissingData} />);
            }).not.toThrow();

            expect(screen.getAllByTestId('book-card')).toHaveLength(booksWithMissingData.length);
        });

        it('should handle very long search terms', () => {
            render(<BookList books={mockBooks} />);

            const longSearchTerm = 'a'.repeat(1000);
            const searchInput = screen.getByPlaceholderText('Search for a book...');

            expect(() => {
                fireEvent.change(searchInput, { target: { value: longSearchTerm } });
            }).not.toThrow();

            expect(screen.queryAllByTestId('book-card')).toHaveLength(0);
        });

    });

    describe('Accessibility', () => {
        it('should have accessible search input with placeholder', () => {
            render(<BookList books={mockBooks} />);

            const searchInput = screen.getByPlaceholderText('Search for a book...');
            expect(searchInput).toBeInTheDocument();
            expect(searchInput).toHaveAttribute('type', 'text');
        });

        it('should have accessible select elements with labels', () => {
            render(<BookList books={mockBooks} />);

            expect(screen.getByText('Sort by:')).toBeInTheDocument();
            expect(screen.getAllByRole('combobox')).toHaveLength(2);
        });
    });
});