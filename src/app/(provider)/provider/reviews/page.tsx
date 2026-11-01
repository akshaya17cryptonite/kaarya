import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/service";
import { getProviderProfileByUserId } from "@/modules/providers/service";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewReplyForm } from "@/components/provider/review-reply-form";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProviderReviewsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?role=PROVIDER&redirectTo=/provider/reviews");
  }

  const provider = await getProviderProfileByUserId(session.id);
  const reviews = provider.reviews || [];

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Reviews & Ratings</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build trust and boost your search ranking by maintaining high ratings and responding to customer feedback.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card border p-3 rounded-xl shadow-sm shrink-0">
          <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-1">
            <Star className="w-7 h-7 fill-amber-500" />
            <span>{provider.averageRating.toFixed(1)}</span>
          </div>
          <div className="text-xs border-l pl-3">
            <span className="font-bold block text-foreground">Verified Rating</span>
            <span className="text-muted-foreground">{provider.totalReviews} total reviews</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No customer reviews yet. Reviews will appear here once customers rate your completed bookings.
          </Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className="overflow-hidden border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{r.customerName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.serviceName}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Reviewed on {formatDate(r.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= r.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-xs text-foreground bg-muted/20 p-3 rounded-lg leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}

                <ReviewReplyForm reviewId={r.id} initialReply={r.providerReply} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
