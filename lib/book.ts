// Dummy data and fetch functions to simulate your API / DB

export interface Review {
  id: string;
  content: string;
  rating: number;
  author: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  reviews: Review[];
}

const books: Book[] = [
  {
    id: '1',
    title: 'First Book',
    description: 'This is the first book',
    reviews: [
      { id: 'r1', content: 'Great book!', rating: 5, author: 'Alice' },
      { id: 'r2', content: 'Not bad', rating: 3, author: 'Bob' },
    ],
  },
  {
    id: '2',
    title: 'Second Book',
    description: 'This is the second book',
    reviews: [],
  },
];

// Simulate async fetching
export async function getAllBooks(): Promise<Book[]> {
  return books;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return books.find((b) => b.id === id);
}
