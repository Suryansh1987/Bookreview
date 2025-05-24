"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

interface ReviewFormProps {
  bookId: string;
  onReviewSubmitted: (review: any) => void;
}

export default function ReviewForm({ bookId, onReviewSubmitted }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a review",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          rating: data.rating,
          comment: data.comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      const reviewData = await response.json();

      // Add user information to the review data
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        reviewData.user = {
          id: userData.id,
          name: userData.name,
          avatar: userData.avatar,
        };
      }

      onReviewSubmitted(reviewData);

      // Reset form
      form.reset({
        rating: 0,
        comment: "",
      });
    } catch (error: unknown) {
      console.error("Error submitting review:", error);

      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while submitting your review";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <StarRating
                  rating={field.value}
                  onChange={(rating) => field.onChange(rating)}
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts about this book..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || form.getValues().rating === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </Form>
  );
}
