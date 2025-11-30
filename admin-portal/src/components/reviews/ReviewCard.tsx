"use client";

import React, { memo, useMemo } from "react";
import { Star, Check, X, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  onApprove?: (review: Review) => void;
  onReject?: (review: Review) => void;
  onRespond?: (review: Review) => void;
}

/**
 * Memoized review card component for optimized list rendering
 */
export const ReviewCard = memo(function ReviewCard({
  review,
  onApprove,
  onReject,
  onRespond,
}: ReviewCardProps) {
  // Memoize status badge variant
  const statusVariant = useMemo(() => {
    switch (review.status) {
      case "approved":
        return "default" as const;
      case "rejected":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }, [review.status]);

  // Memoize formatted time
  const formattedTime = useMemo(() => {
    try {
      return formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  }, [review.createdAt]);

  // Memoize star rating display
  const stars = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 ${
          star <= review.rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  }, [review.rating]);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{review.userName}</h3>
            <Badge variant={statusVariant}>{review.status}</Badge>
          </div>
          <p className="text-sm text-gray-600">Provider: {review.providerName}</p>
          <p className="text-sm text-gray-500">{formattedTime}</p>
        </div>
        <div className="flex">{stars}</div>
      </div>

      <p className="text-gray-700 mb-4">{review.comment}</p>

      {review.response && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            Response from {review.respondedBy}
          </p>
          <p className="text-sm text-blue-800">{review.response}</p>
        </div>
      )}

      <div className="flex gap-2">
        {review.status === "pending" && (
          <>
            {onApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(review)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(review)}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            )}
          </>
        )}

        {review.status === "approved" && !review.response && onRespond && (
          <Button size="sm" variant="outline" onClick={() => onRespond(review)}>
            <MessageSquare className="w-4 h-4 mr-1" />
            Respond
          </Button>
        )}
      </div>
    </Card>
  );
});

// Display name for debugging
ReviewCard.displayName = "ReviewCard";
