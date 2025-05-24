"use client";

import { useEffect, useState } from "react";
import BookList from "@/components/book-list";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FeaturedBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/books?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured books');
        }
        
        const data = await response.json();
        setBooks(data.books);
      } catch (error) {
        console.error('Error fetching featured books:', error);
        toast({
          title: 'Error',
          description: 'Failed to load featured books. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedBooks();
  }, [toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!books.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No books available at the moment.</p>
      </div>
    );
  }
  
  return <BookList books={books} />;
}