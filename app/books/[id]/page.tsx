"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import StarRating from '@/components/star-rating';
import ReviewList from '@/components/review-list';
import ReviewForm from '@/components/review-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function BookDetailPage() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/books/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          } else {
            throw new Error('Failed to fetch book details');
          }
        }
        
        const bookData = await response.json();
        setBook(bookData);
        
        // Check if user has already reviewed
        if (user && bookData.reviews) {
          const hasReviewed = bookData.reviews.some(review => review.user.id === user.id);
          setUserHasReviewed(hasReviewed);
        }
      } catch (err) {
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBookDetails();
    }
  }, [id, user, toast]);
  
  // Handle new review submission
  const handleReviewSubmitted = (newReview) => {
    setBook(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      rating: {
        avgRating: (prev.rating.avgRating * prev.rating.count + newReview.rating) / (prev.rating.count + 1),
        count: prev.rating.count + 1
      }
    }));
    setUserHasReviewed(true);
    
    toast({
      title: 'Review submitted',
      description: 'Your review has been successfully submitted.',
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6">{error || 'Book not found'}</p>
        <Button asChild>
          <a href="/books">Back to Books</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        
        {/* Book Details */}
        <div className="md:col-span-2">
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
              {book.author && (
                <p className="text-lg text-muted-foreground mb-4">by {book.author.name}</p>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={book.rating.avgRating} />
                <span className="text-muted-foreground">
                  {book.rating.avgRating.toFixed(1)} ({book.rating.count} {book.rating.count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{book.genre}</Badge>
                {book.pageCount && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {book.pageCount} pages
                  </Badge>
                )}
                {book.publishedDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {format(new Date(book.publishedDate), 'MMMM yyyy')}
                  </Badge>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-4">About this book</h2>
              <p className="text-muted-foreground whitespace-pre-line">{book.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-10" />
      
      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Reviews</h2>
        
        {user && !userHasReviewed && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-4">Add Your Review</h3>
            <ReviewForm bookId={id} onReviewSubmitted={handleReviewSubmitted} />
          </div>
        )}
        
        {user && userHasReviewed && (
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p>You've already reviewed this book. Thank you for your contribution!</p>
          </div>
        )}
        
        {!user && (
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p>Please <a href="/auth/login" className="text-primary hover:underline">log in</a> to leave a review.</p>
          </div>
        )}
        
        <ReviewList reviews={book.reviews} />
      </div>
    </div>
  );
}