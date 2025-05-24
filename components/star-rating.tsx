"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  onChange,
}: StarRatingProps) {
  const interactive = !!onChange;
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const renderStar = (position: number) => {
    const filled = rating >= position;
    const halfFilled = rating >= position - 0.5 && rating < position;
    
    return (
      <span
        key={position}
        className={cn(
          "text-muted transition-colors",
          filled && "text-yellow-500",
          halfFilled && "text-yellow-500/70",
          interactive && "cursor-pointer"
        )}
        onClick={() => interactive && onChange(position)}
      >
        <Star
          className={cn(
            sizeClasses[size],
            filled && "fill-current",
            halfFilled && "fill-current opacity-70"
          )}
        />
      </span>
    );
  };
  
  return (
    <div className="flex space-x-1">
      {Array.from({ length: max }, (_, i) => renderStar(i + 1))}
    </div>
  );
}