import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BookCard from './BookCards';
import { fetchBookCover } from '../../utils/FetchBookCover';

vi.mock('../../utils/FetchBookCover', () => ({
  fetchBookCover: vi.fn(),
}));

describe('BookCard Component', () => {
  const defaultProps = {
    title: 'Test Title',
    authors: ['Author 1', 'Author 2'],
    isbn: '1234567890',
    coverUrl: 'http://example.com/cover.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly with given props', () => {
    (fetchBookCover as any).mockResolvedValue('http://example.com/fetched.jpg');
    render(<BookCard {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Author 1, Author 2')).toBeInTheDocument();
  });

  it('fetches cover URL on mount and updates image', async () => {
    (fetchBookCover as any).mockResolvedValue('http://example.com/fetched-cover.jpg');
    
    render(<BookCard {...defaultProps} coverUrl="" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Title');
      expect(img).toHaveAttribute('src', 'http://example.com/fetched-cover.jpg');
    });
    
    expect(fetchBookCover).toHaveBeenCalledWith('1234567890');
  });

  it('falls back to coverUrl prop if fetch returns null', async () => {
    (fetchBookCover as any).mockResolvedValue(null);
    
    render(<BookCard {...defaultProps} />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Title');
      expect(img).toHaveAttribute('src', 'http://example.com/cover.jpg');
    });
  });

  it('uses openlibrary fallback URL correctly when image fails to load', async () => {
    (fetchBookCover as any).mockResolvedValue(null);
    render(<BookCard {...defaultProps} coverUrl="broken.jpg" />);
    
    // Wait for the initial image load attempt with broken.jpg
    await waitFor(() => {
      expect(screen.getByAltText('Test Title')).toHaveAttribute('src', 'broken.jpg');
    });

    const img = screen.getByAltText('Test Title');
    fireEvent.error(img);
    
    expect(img).toHaveAttribute('src', `https://covers.openlibrary.org/b/isbn/${defaultProps.isbn}-M.jpg`);
  });
});
