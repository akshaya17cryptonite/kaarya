"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Check, Loader2, Sparkles } from "lucide-react";
import { replyToReviewAction } from "@/modules/providers/actions";

interface ReviewReplyFormProps {
  reviewId: string;
  initialReply: string | null;
}

const TEMPLATES = [
  "Thank you so much for the 5-star rating! Glad we could solve the issue quickly.",
  "Thank you for choosing LocConnect! Always happy to provide top-quality service.",
  "Appreciate your valuable feedback. We strive to maintain the highest standards.",
];

export function ReviewReplyForm({ reviewId, initialReply }: ReviewReplyFormProps) {
  const [replyText, setReplyText] = useState(initialReply || "");
  const [isEditing, setIsEditing] = useState(!initialReply);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("reviewId", reviewId);
      formData.set("replyText", replyText.trim());

      const res = await replyToReviewAction(formData);
      if (res.success) {
        setSuccess(true);
        setIsEditing(false);
      } else {
        setError(res.error || "Failed to post response.");
      }
    });
  };

  if (!isEditing && initialReply) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Your Response:
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
          >
            Edit
          </Button>
        </div>
        <p className="text-xs text-foreground italic">&ldquo;{initialReply}&rdquo;</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 bg-muted/30 p-4 rounded-xl border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          Respond to Customer
        </label>
        {initialReply && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="text-xs h-6 px-2 text-muted-foreground"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Suggested Quick Templates */}
      <div className="space-y-1">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Click to use quick response:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((tmpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setReplyText(tmpl)}
              className="text-[10px] px-2 py-1 rounded-md bg-background border hover:bg-muted text-muted-foreground transition-colors text-left"
            >
              {tmpl.slice(0, 45)}...
            </button>
          ))}
        </div>
      </div>

      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a polite, professional reply to thank the customer or address their feedback..."
        rows={2}
        className="text-xs bg-background"
        required
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-600 font-medium">Reply posted successfully!</p>}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-muted-foreground">
          Your reply is visible on your public marketplace profile.
        </span>
        <Button
          type="submit"
          size="sm"
          variant="brand"
          disabled={isPending || !replyText.trim()}
          className="gap-1.5"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>{initialReply ? "Update Reply" : "Post Reply"}</span>
        </Button>
      </div>
    </form>
  );
}
