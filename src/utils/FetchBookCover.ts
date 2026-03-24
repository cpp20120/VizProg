export const fetchBookCover = async (
  isbn: string
): Promise<string> => {
  const placeholderCover = 'public/placeholder.png';

  const fetchCoverFromGoogleBooks = async () => {
    try {
      const googleBooksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      
      if (googleBooksResponse.status === 429) {
        console.warn('Google Books API rate limited (429), switching to Open Library');
        return undefined;
      }
      
      const data = await googleBooksResponse.json();
      const imageUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      
      if (imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) return undefined;
        const blob = await imageResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error fetching cover from Google Books:', error);
    }
    return undefined;
  };

  const fetchCoverFromOpenLibrary = async () => {
    try {
      const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
      const imageResponse = await fetch(openLibraryUrl);
      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error fetching cover from Open Library:', error);
    }
    return undefined;
  };

  return (await fetchCoverFromGoogleBooks()) || (await fetchCoverFromOpenLibrary()) || placeholderCover;
};
