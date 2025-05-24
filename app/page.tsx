import FeaturedBooks from '@/components/featured-books';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32 overflow-hidden bg-gradient-to-r from-background via-background to-muted">
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Discover Your Next <span className="text-primary">Great Read</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Join thousands of book lovers who share and discover new literary adventures every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/books">
                    Browse Books <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/register">Join the Community</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] hidden md:block">
              <div className="absolute transform rotate-6 shadow-lg rounded-lg overflow-hidden w-48 h-64 top-10 right-32">
                <Image 
                  src="https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Book Cover" 
                  className="object-cover w-full h-full"
                  width={192}
                  height={256}
                />
              </div>
              <div className="absolute transform -rotate-3 shadow-lg rounded-lg overflow-hidden w-48 h-64 top-20 left-32">
                <Image 
                  src="https://images.pexels.com/photos/1883385/pexels-photo-1883385.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Book Cover" 
                  className="object-cover w-full h-full"
                  width={192}
                  height={256}
                />
              </div>
              <div className="absolute transform rotate-12 shadow-lg rounded-lg overflow-hidden w-48 h-64 bottom-10 right-20">
                <Image 
                  src="https://images.pexels.com/photos/5834425/pexels-photo-5834425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Book Cover" 
                  className="object-cover w-full h-full"
                  width={192}
                  height={256}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-background opacity-70"></div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10">
            <h2 className="text-3xl font-bold mb-4 md:mb-0">Featured Books</h2>
            <Link href="/books" className="text-primary hover:underline flex items-center gap-1">
              View all books <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <FeaturedBooks />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join BookWorm?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover New Books</h3>
              <p className="text-muted-foreground">
                Find your next favorite read from our extensive collection across all genres.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rate & Review</h3>
              <p className="text-muted-foreground">
                Share your thoughts and help others discover great books with your honest reviews.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Join the Community</h3>
              <p className="text-muted-foreground">
                Connect with fellow book lovers and discover recommendations from like-minded readers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}