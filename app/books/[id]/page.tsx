import { getAllBooks, getBookById } from '@/lib/book';
import ReviewSection from './ReviewSection';

interface Book {
  id: number | string;
  title: string;
  description: string;
  reviews?: any[]; // adjust type for reviews if you have it
}

interface BookPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const books: Book[] = await getAllBooks();

  return books.map((book) => ({
    id: book.id.toString(),
  }));
}

export default async function BookPage({ params }: BookPageProps) {
  const book: Book | null = await getBookById(params.id);

  if (!book) {
    return <p>Book not found</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-gray-700 mb-6">{book.description}</p>

      <ReviewSection bookId={book.id.toString()} reviews={book.reviews ?? []} />
    </main>
  );
}
