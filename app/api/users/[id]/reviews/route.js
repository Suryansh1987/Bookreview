import { NextResponse } from 'next/server';
import { db } from '../../../db/db';
import { reviews, books } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/users/:id/reviews
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const userReviews = await db.select()
      .from(reviews)
      .leftJoin(books, eq(reviews.bookId, books.id))
      .where(eq(reviews.userId, id))
      .orderBy(desc(reviews.createdAt));

    const formattedReviews = userReviews.map(review => ({
      id: review.reviews.id,
      rating: review.reviews.rating,
      comment: review.reviews.comment,
      createdAt: review.reviews.createdAt,
      book: {
        id: review.books.id,
        title: review.books.title,
        coverImage: review.books.coverImage
      }
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
