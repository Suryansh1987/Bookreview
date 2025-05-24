"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/star-rating";
import { BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserReviewsProps {
  userId: string;
}

export default function UserReviews({ userId }: UserReviewsProps) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/users/${userId}/reviews`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user reviews');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reviews. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserReviews();
    }
  }, [userId, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!reviews.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven't reviewed any books yet.
        </p>
        <Button asChild>
          <Link href="/books">Browse Books</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={review.id}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="shrink-0">
                  <Link href={`/books/${review.book.id}`}>
                    <div className="relative w-24 h-36 rounded-md overflow-hidden">
                      {review.book.coverImage ? (
                        <Image
                          src={review.book.coverImage}
                          alt={review.book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <Link href={`/books/${review.book.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg">{review.book.title}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shrink-0 mt-2 sm:mt-0"
                    >
                      <Link href={`/books/${review.book.id}`}>View Book</Link>
                    </Button>
                  </div>
                  
                  {review.comment && (
                    <p className="text-muted-foreground mt-4">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {index < reviews.length - 1 && <Separator className="my-6" />}
        </div>
      ))}
    </div>
  );
}