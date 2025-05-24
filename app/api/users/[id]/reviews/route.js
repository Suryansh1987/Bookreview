import { NextResponse } from 'next/server';
import { db } from '../../../db/db';
import { reviews } from '../../../db/schema';
import { verifyToken } from '../../../../../lib/auth'; // Your JWT token verification function

export async function POST(request) {
  try {
    // Get and verify token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token); // returns user object or null if invalid
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body JSON
    const { bookId, rating, comment } = await request.json();

    // Validate required fields manually if you want or rely on client validation
    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    // Insert review in DB
    const [insertedReview] = await db.insert(reviews).values({
      bookId,
      userId: user.id,
      rating,
      comment: comment || '',
      createdAt: new Date(),
    }).returning();

    // Return inserted review JSON
    return NextResponse.json(insertedReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
  }
}
