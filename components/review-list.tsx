"use client";

import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/components/star-rating";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={review.id}>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={review.user.avatar} />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div>
                  <h4 className="font-medium">{review.user.name}</h4>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-muted-foreground mt-2">{review.comment}</p>
              )}
            </div>
          </div>
          
          {index < reviews.length - 1 && <Separator className="my-6" />}
        </div>
      ))}
    </div>
  );
}