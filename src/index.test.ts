import { describe, it, expect } from 'vitest';
import {
  createUser,
  createBook,
  calculateArea,
  getStatusColor,
  capitalizeFirstLetter,
  trimAndUppercase,
  getFirstElement,
  findById,
  type User,
  type Book,
  type Status
} from './index'; 


describe('createUser', () => {
  it('should create a user with all fields provided', () => {
    const user = createUser(1, 'John Doe', 'john@example.com', true);
    
    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true
    });
  });

  it('should create a user with default isActive value when not provided', () => {
    const user = createUser(2, 'Jane Doe', 'jane@example.com');
    
    expect(user).toEqual({
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      isActive: true
    });
  });

  it('should create a user without email when not provided', () => {
    const user = createUser(3, 'Bob Smith', undefined, false);
    
    expect(user).toEqual({
      id: 3,
      name: 'Bob Smith',
      email: undefined,
      isActive: false
    });
  });

  it('should create a user with only required fields', () => {
    const user = createUser(4, 'Alice Johnson');
    
    expect(user).toEqual({
      id: 4,
      name: 'Alice Johnson',
      email: undefined,
      isActive: true
    });
  });
});

describe('createBook', () => {
  it('should create a book with all fields', () => {
    const bookData: Book = {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      year: 1937,
      genre: 'fiction'
    };
    
    const book = createBook(bookData);
    expect(book).toEqual(bookData);
  });

  it('should create a book without year field', () => {
    const bookData: Book = {
      title: 'Unknown Book',
      author: 'Anonymous',
      genre: 'non-fiction'
    };
    
    const book = createBook(bookData);
    expect(book).toEqual(bookData);
  });

  it('should work with non-fiction genre', () => {
    const bookData: Book = {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      year: 2011,
      genre: 'non-fiction'
    };
    
    const book = createBook(bookData);
    expect(book).toEqual(bookData);
  });
});

describe('calculateArea', () => {
  it('should calculate circle area correctly', () => {
    const radius = 5;
    const expectedArea = Math.PI * radius * radius;
    
    expect(calculateArea('circle', radius)).toBeCloseTo(expectedArea, 5);
  });

  it('should calculate circle area with radius 0', () => {
    expect(calculateArea('circle', 0)).toBe(0);
  });

  it('should calculate circle area with negative radius', () => {
    const radius = -5;
    const expectedArea = Math.PI * radius * radius;
    expect(calculateArea('circle', radius)).toBeCloseTo(expectedArea, 5);
  });

  it('should calculate square area correctly', () => {
    const side = 4;
    const expectedArea = side * side;
    
    expect(calculateArea('square', side)).toBe(expectedArea);
  });

  it('should calculate square area with side 0', () => {
    expect(calculateArea('square', 0)).toBe(0);
  });

  it('should calculate square area with negative side', () => {
    const side = -3;
    const expectedArea = side * side; 
    expect(calculateArea('square', side)).toBe(expectedArea);
  });
});

describe('getStatusColor', () => {
  it('should return green for active status', () => {
    expect(getStatusColor('active')).toBe('green');
  });

  it('should return red for inactive status', () => {
    expect(getStatusColor('inactive')).toBe('red');
  });

  it('should return blue for new status', () => {
    expect(getStatusColor('new')).toBe('blue');
  });

  it('should handle all status types', () => {
    const statuses: Status[] = ['active', 'inactive', 'new'];
    const expectedColors = ['green', 'red', 'blue'];
    
    statuses.forEach((status, index) => {
      expect(getStatusColor(status)).toBe(expectedColors[index]);
    });
  });
});

describe('capitalizeFirstLetter', () => {
  it('should capitalize first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('should handle leading spaces', () => {
    expect(capitalizeFirstLetter('  hello')).toBe('  Hello');
  });

  it('should handle empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('should handle string with only spaces', () => {
    expect(capitalizeFirstLetter('   ')).toBe('   ');
  });

  it('should uppercase entire string when uppercase parameter is true', () => {
    expect(capitalizeFirstLetter('hello', true)).toBe('HELLO');
  });

  it('should handle leading spaces with uppercase parameter', () => {
    expect(capitalizeFirstLetter('  hello', true)).toBe('  HELLO');
  });

  it('should not change already capitalized word', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
    expect(capitalizeFirstLetter('A')).toBe('A');
  });
});

describe('trimAndUppercase', () => {
  it('should trim whitespace', () => {
    expect(trimAndUppercase('  hello  ')).toBe('hello');
  });

  it('should trim and uppercase when parameter is true', () => {
    expect(trimAndUppercase('  hello  ', true)).toBe('HELLO');
  });

  it('should handle empty string', () => {
    expect(trimAndUppercase('')).toBe('');
    expect(trimAndUppercase('', true)).toBe('');
  });

  it('should handle string with only spaces', () => {
    expect(trimAndUppercase('   ')).toBe('');
    expect(trimAndUppercase('   ', true)).toBe('');
  });

  it('should preserve internal spaces', () => {
    expect(trimAndUppercase('  hello world  ')).toBe('hello world');
    expect(trimAndUppercase('  hello world  ', true)).toBe('HELLO WORLD');
  });
});

describe('getFirstElement', () => {
  it('should return first element of non-empty array', () => {
    const arr = [1, 2, 3];
    expect(getFirstElement(arr)).toBe(1);
  });

  it('should return first element of array with strings', () => {
    const arr = ['a', 'b', 'c'];
    expect(getFirstElement(arr)).toBe('a');
  });

  it('should return undefined for empty array', () => {
    const arr: number[] = [];
    expect(getFirstElement(arr)).toBeUndefined();
  });

  it('should work with array of objects', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    expect(getFirstElement(arr)).toEqual({ id: 1 });
  });

  it('should work with array of mixed types', () => {
    const arr = [1, 'two', true];
    expect(getFirstElement(arr)).toBe(1);
  });
});

describe('findById', () => {
  it('should find item by id in array', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ];
    
    expect(findById(items, 2)).toEqual({ id: 2, name: 'Item 2' });
  });

  it('should return undefined when id not found', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    
    expect(findById(items, 3)).toBeUndefined();
  });

  it('should work with empty array', () => {
    const items: Array<{ id: number }> = [];
    expect(findById(items, 1)).toBeUndefined();
  });

  it('should work with different object structures', () => {
    const users: User[] = [
      { id: 1, name: 'User 1', isActive: true },
      { id: 2, name: 'User 2', email: 'test@test.com', isActive: false }
    ];
    
    expect(findById(users, 2)).toEqual({
      id: 2,
      name: 'User 2',
      email: 'test@test.com',
      isActive: false
    });
  });

  it('should find first matching id when duplicates exist', () => {
    const items = [
      { id: 1, value: 'first' },
      { id: 1, value: 'second' }
    ];
    
    expect(findById(items, 1)).toEqual({ id: 1, value: 'first' });
  });
});