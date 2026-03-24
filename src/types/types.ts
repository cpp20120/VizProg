export interface Book {
    id: number;
    title: string;
    isbn: string;
    pageCount: number;
    authors: string[];
    cover?: string;
  }