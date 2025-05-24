import { getAllBooks, getBookById } from '@/lib/book';
import ReviewSection from './ReviewSection';
import type { Review } from '../../../lib/book';
interface BookPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const books = await getAllBooks();
  return books.map((book) => ({
    id: book.id,
  }));
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBookById(params.id);

  if (!book) {
    return <p>Book not found</p>;
  }

  return (
    <main>
      <h1>{book.title}</h1>
      <p>{book.description}</p>

      {/* Client-side review section */}
      <ReviewSection bookId={book.id} reviews={book.reviews} />
    </main>
  );
}
