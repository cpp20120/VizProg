export interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

export function createUser(id: number, name: string, email?: string, isActive: boolean = true): User {
  return { id, name, email, isActive };
}

export type BookGenre = 'fiction' | 'non-fiction';

export interface Book {
  title: string;
  author: string;
  year?: number;
  genre: BookGenre;
}

export function createBook(book: Book): Book {
    return book;
}

export function calculateArea(shape: 'circle', radius: number): number;
export function calculateArea(shape: 'square', side: number): number;
export function calculateArea(shape: 'circle' | 'square', value: number): number {
  if (shape === 'circle') {
    return Math.PI * value * value;
  } else {
    return value * value;
  }
}

export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status): string {
  switch (status) {
    case 'active': return 'green';
    case 'inactive': return 'red';
    case 'new': return 'blue';
    default:
      return 'gray';
    }
}

export type StringFormatter = (str: string, uppercase?: boolean) => string;

export const capitalizeFirstLetter: StringFormatter = (str, uppercase = false) => {
  if (uppercase) return str.toUpperCase();
  
  const trimmed = str.trimStart();
  if (trimmed.length === 0) return str;
  
  const firstNonSpaceIndex = str.length - trimmed.length;
  return str.substring(0, firstNonSpaceIndex) + 
         trimmed.charAt(0).toUpperCase() + 
         trimmed.slice(1);
};

export const trimAndUppercase: StringFormatter = (str, uppercase = false) => {
  const trimmed = str.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
};

export function getFirstElement<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

export interface HasId {
  id: number;
}

export function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}


const user1 = createUser(1, "Ivan Ivanov", "ivan@aboba.com");
const book1 = createBook({ title: "1984", author: "George Orwell", year: 1949, genre: "fiction" });
const circleArea = calculateArea('circle', 5);
const activeColor = getStatusColor('active');
const result1 = capitalizeFirstLetter(" hello world   ");
const numbers = [1, 2, 3];
const firstNumber = getFirstElement(numbers);

console.log(user1);
console.log(book1);
console.log(circleArea);
console.log(activeColor);
console.log(result1);
console.log(numbers);
console.log(firstNumber);