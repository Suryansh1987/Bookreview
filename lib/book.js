
import { db } from '../app/api/db/db'; 
import { books, reviews } from '../app/api/db/schema'; 
import { eq } from 'drizzle-orm';


export async function getBookById(id) {
  const rows = await db
    .select({
      book: books,
      review: reviews,
    })
    .from(books)
    .leftJoin(reviews, eq(reviews.bookId, books.id))
    .where(eq(books.id, id));  

  if (rows.length === 0) return undefined;

  const book = {
    ...rows[0].book,
    reviews: rows.map(row => row.review).filter(Boolean),
  };

  return book;
}

export async function getAllBooks() {
  return await db.select().from(books);
}
