import { NextResponse } from 'next/server';
import { db } from '../db/db';               // Adjust path to your db
import { books, reviews, authors } from '../db/schema';
import { eq, like, and, desc, sql } from 'drizzle-orm';

// Utility to parse query params safely
function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

// Helper to validate URLs
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// GET /api/books?{page,limit,search,genre}
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 10);
    const offset = (page - 1) * limit;
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');

    const conditions = [];
    if (search) conditions.push(like(books.title, `%${search}%`));
    if (genre) conditions.push(eq(books.genre, genre));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Parallel queries for books and total count
    const [booksResult, totalCountResult] = await Promise.all([
      db.select()
        .from(books)
        .leftJoin(authors, eq(books.authorId, authors.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(books.createdAt)),

      db.select({ count: sql`count(*)` })
        .from(books)
        .where(whereClause),
    ]);

    const totalCount = parseInt(totalCountResult[0]?.count || '0', 10);

    // Get ratings for each book
    const bookIds = booksResult.map(book => book.books.id);
    let ratingsMap = {};

    if (bookIds.length > 0) {
      const ratingsResult = await db.select({
        bookId: reviews.bookId,
        avgRating: sql`AVG(${reviews.rating})`,
        count: sql`COUNT(*)`,
      })
        .from(reviews)
        .where(sql`${reviews.bookId} IN (${sql.join(bookIds, sql`,`)})`)
        .groupBy(reviews.bookId);

      ratingsMap = ratingsResult.reduce((acc, item) => {
        acc[item.bookId] = {
          avgRating: parseFloat(item.avgRating) || 0,
          count: parseInt(item.count, 10),
        };
        return acc;
      }, {});
    }

    // Format books for response
    const formattedBooks = booksResult.map(book => ({
      id: book.books.id,
      title: book.books.title,
      coverImage: book.books.coverImage,
      genre: book.books.genre,
      publishedDate: book.books.publishedDate,
      author: book.authors
        ? {
            id: book.authors.id,
            name: book.authors.name,
          }
        : null,
      rating: ratingsMap[book.books.id] || { avgRating: 0, count: 0 },
    }));

    return NextResponse.json({
      books: formattedBooks,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST /api/books - add new book (admin only)
export async function POST(request) {
  try {
    // Run auth & admin checks (adjust your authMiddleware accordingly)
    const { authMiddleware } = await import('../middleware/auth'); // dynamic import if needed
    const user = await authMiddleware(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Basic validation
    if (!body.title) return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    if (!body.description) return NextResponse.json({ message: 'Description is required' }, { status: 400 });
    if (body.coverImage && !isValidUrl(body.coverImage))
      return NextResponse.json({ message: 'Cover image must be a valid URL' }, { status: 400 });
    if (!body.genre) return NextResponse.json({ message: 'Genre is required' }, { status: 400 });
    if (body.publishedDate && isNaN(Date.parse(body.publishedDate)))
      return NextResponse.json({ message: 'Published date must be a valid date' }, { status: 400 });
    if (body.pageCount && (!Number.isInteger(body.pageCount) || body.pageCount < 1))
      return NextResponse.json({ message: 'Page count must be a positive integer' }, { status: 400 });
    if (!body.authorId) return NextResponse.json({ message: 'Author ID is required' }, { status: 400 });

    // Check author exists
    const authorExists = await db.select()
      .from(authors)
      .where(eq(authors.id, body.authorId))
      .limit(1);

    if (!authorExists.length) {
      return NextResponse.json({ message: 'Author not found' }, { status: 404 });
    }

    // Insert new book
    const [newBook] = await db.insert(books)
      .values({
        title: body.title,
        description: body.description,
        coverImage: body.coverImage || null,
        isbn: body.isbn || null,
        genre: body.genre,
        publishedDate: body.publishedDate ? new Date(body.publishedDate) : null,
        pageCount: body.pageCount || null,
        authorId: body.authorId,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
