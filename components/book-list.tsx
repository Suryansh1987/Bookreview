"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import StarRating from "@/components/star-rating";

interface Book {
  id: string;
  title: string;
  coverImage?: string;
  genre: string;
  publishedDate?: string;
  author?: {
    id: string;
    name: string;
  };
  rating: {
    avgRating: number;
    count: number;
  };
}

interface BookListProps {
  books: Book[];
}

export default function BookList({ books }: BookListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <Link href={`/books/${book.id}`} key={book.id}>
          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="relative">
              <AspectRatio ratio={2/3}>
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
              <Badge className="absolute top-2 right-2">{book.genre}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
              {book.author && (
                <p className="text-sm text-muted-foreground mb-2">
                  by {book.author.name}
                </p>
              )}
              <div className="flex items-center gap-1 mt-auto">
                <StarRating rating={book.rating.avgRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  ({book.rating.count})
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}