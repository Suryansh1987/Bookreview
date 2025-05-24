"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookList from '@/components/book-list';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, X } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { useToast } from '@/hooks/use-toast';
import { GENRE_OPTIONS } from '@/lib/constants';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Get query params, default genre to "all"
  const searchQuery = searchParams.get('search') || '';
  const genreFilter = searchParams.get('genre') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for search form inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [genreInput, setGenreInput] = useState(genreFilter);

  // Sync inputs if search params change externally
  useEffect(() => {
    setSearchInput(searchQuery);
    setGenreInput(genreFilter);
  }, [searchQuery, genreFilter]);

useEffect(() => {
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (genreFilter && genreFilter !== 'all') queryParams.append('genre', genreFilter);
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');

      const response = await fetch(`/api/books?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data.books);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load books. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  fetchBooks();
}, [searchQuery, genreFilter, currentPage, toast]);

  // Handle search submit with proper typing
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchInput.trim()) params.append('search', searchInput.trim());
    if (genreInput && genreInput !== 'all') params.append('genre', genreInput);
    params.append('page', '1'); // Reset page on new search/filter

    router.push(`/books?${params.toString()}`);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput('');
    setGenreInput('all');
    router.push('/books');
  };

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    // Create mutable URLSearchParams from readonly searchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Book Library</h1>
          <p className="text-muted-foreground">
            Discover and explore our collection of books
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={genreInput} onValueChange={setGenreInput}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {GENRE_OPTIONS.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value}>
                    {genre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button type="submit">Filter</Button>
              {(searchQuery || (genreFilter && genreFilter !== 'all')) && (
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Separator className="mb-8" />

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : books.length > 0 ? (
        <>
          <BookList books={books} />

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No books found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || (genreFilter && genreFilter !== 'all')
              ? "Try adjusting your search or filter to find what you're looking for."
              : 'There are no books in the library yet.'}
          </p>
          {(searchQuery || (genreFilter && genreFilter !== 'all')) && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
