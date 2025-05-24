'use client';

import { useState } from 'react';
interface Review {
  id: string;
  content: string;
  rating: number;
  author: string;
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
            <strong>{review.author}:</strong> {review.content} (Rating: {review.rating})
          </li>
        ))}
      </ul>

      <ReviewForm bookId={bookId} onReviewSubmitted={onReviewSubmitted} />
    </section>
  );
}

interface ReviewFormProps {
  bookId: string;
  onReviewSubmitted: (review: Review) => void;
}

function ReviewForm({ bookId, onReviewSubmitted }: ReviewFormProps) {
  // For demo, no real input, just a button to add a dummy review

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      content: 'This is a new review!',
      rating: 4,
      author: 'New User',
    };

    onReviewSubmitted(newReview);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Add Review</button>
    </form>
  );
}
