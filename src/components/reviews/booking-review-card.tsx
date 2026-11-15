"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star, CheckCircle, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { submitReviewAction } from "@/modules/reviews/actions";
import { type ReviewDetail } from "@/modules/reviews/service";

interface BookingReviewCardProps {
  bookingId: string;
  providerName: string;
  existingReview: ReviewDetail | null;
  isCompleted: boolean;
}

const STAR_LABELS: Record<number, string> = {
  1: "1 - Disappointing",
  2: "2 - Needs Improvement",
  3: "3 - Satisfactory / Average",
  4: "4 - Very Good",
  5: "5 - Outstanding & Highly Recommended",
};

export function BookingReviewCard({
  bookingId,
  providerName,
  existingReview,
  isCompleted,
}: BookingReviewCardProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submittedReview, setSubmittedReview] = useState<ReviewDetail | null>(existingReview);
  const [error, setError] = useState<string | null>(null);

  // If already reviewed, display the completed review card
  if (submittedReview) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden">
        <CardHeader className="pb-3 border-b bg-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-foreground">
                Your Review & Rating for {providerName}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background">
              Verified Review
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Submitted on {formatDate(submittedReview.createdAt)}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= submittedReview.rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-xs font-bold text-foreground ml-2">
              {STAR_LABELS[submittedReview.rating] || `${submittedReview.rating} Stars`}
            </span>
          </div>

          {submittedReview.comment && (
            <p className="text-xs text-foreground bg-background/80 p-3 rounded-lg border leading-relaxed italic">
              &ldquo;{submittedReview.comment}&rdquo;
            </p>
          )}

          {submittedReview.providerReply && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1 mt-2">
              <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5" />
                Response from {providerName}:
              </span>
              <p className="text-foreground italic text-[11px]">
                &ldquo;{submittedReview.providerReply}&rdquo;
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Only display review submission form if the booking status is COMPLETED
  if (!isCompleted) {
    return null;
  }

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("bookingId", bookingId);
      formData.set("rating", rating.toString());
      if (comment.trim()) {
        formData.set("comment", comment.trim());
      }

      const res = await submitReviewAction(formData);
      if (res.success) {
        setSubmittedReview({
          id: `rev_${Date.now()}`,
          bookingId,
          customerId: "current",
          providerId: "provider",
          rating,
          comment: comment.trim() || null,
          providerReply: null,
          createdAt: new Date().toISOString(),
          customerName: "You",
        });
      } else {
        setError(res.error || "Failed to submit review.");
      }
    });
  };

  return (
    <Card className="border-primary/30 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-sm font-bold text-foreground">
            Rate Your Experience with {providerName}
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Your feedback helps neighbors find verified professionals and rewards excellent quality service in Noida.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Overall Service Rating:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 focus:outline-none focus:ring-1 focus:ring-primary rounded transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= activeRating
                          ? "text-amber-500 fill-amber-500 drop-shadow-sm"
                          : "text-muted-foreground/30 hover:text-amber-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-foreground ml-2">
                {STAR_LABELS[activeRating]}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Write a Review (Optional):
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the punctuality, cleanliness, and quality of work? Any tips for other customers?"
              rows={3}
              className="text-xs"
            />
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={isPending}
              className="gap-1.5 text-xs shadow-sm"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Submit Review</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
