import { NextResponse } from 'next/server';
import { db } from '../../../db/db';
import { reviews } from '../../../db/schema';
import { verifyToken } from '../../../../../lib/auth'; 

export async function POST(request) {
  try {
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }


    const { bookId, rating, comment } = await request.json();

   
    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    
    const [insertedReview] = await db.insert(reviews).values({
      bookId,
      userId: user.id,
      rating,
      comment: comment || '',
      createdAt: new Date(),
    }).returning();

   
    return NextResponse.json(insertedReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
  }
}
