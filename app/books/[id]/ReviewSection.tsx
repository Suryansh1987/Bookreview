'use client';

import { useState } from 'react';
import ReviewForm from '../../../components/review-form';  // Adjust path if needed

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Review {
  id: string;
  content?: string;
  comment?: string;
  rating: number;
  author?: string;
  user?: User;
}

interface ReviewSectionProps {
  bookId: string;
  reviews: Review[];
}

export default function ReviewSection({ bookId, reviews }: ReviewSectionProps) {
  const [localReviews, setLocalReviews] = useState(reviews);

  function onReviewSubmitted(newReview: Review) {
    setLocalReviews((prev) => [newReview, ...prev]);
  }

  return (
    <section>
      <h2>Reviews</h2>
      <ul>
        {localReviews.map((review) => (
          <li key={review.id}>
            <strong>{review.author ?? review.user?.name ?? 'Anonymous'}:</strong>{' '}
            {review.content ?? review.comment} (Rating: {review.rating})
          </li>
        ))}
      </ul>

      <ReviewForm bookId={bookId} onReviewSubmitted={onReviewSubmitted} />
    </section>
  );
}
