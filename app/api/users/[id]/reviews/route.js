import { NextResponse } from 'next/server';
import { db } from '../../../db/db';             // adjust your import path
import { reviews, books } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const userId = params.id;

    // Validate userId param (optional, can add more checks)
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch reviews by this user joined with book info
    const userReviews = await db
      .select({
        reviewId: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        bookId: books.id,
        bookTitle: books.title,
        bookCoverImage: books.coverImage,
      })
      .from(reviews)
      .leftJoin(books, eq(reviews.bookId, books.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    // Format response
    const formattedReviews = userReviews.map(r => ({
      id: r.reviewId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      book: {
        id: r.bookId,
        title: r.bookTitle,
        coverImage: r.bookCoverImage,
      },
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
