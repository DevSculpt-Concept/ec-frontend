import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Star } from "lucide-react";
import { useCreateReview, useBookingReview, useUpdateReview } from "@/hooks/useReviews";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  vendorName: string;
  eventTitle: string;
}

export function ReviewModal({ isOpen, onClose, bookingId, vendorName, eventTitle }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: existingReviewData, isLoading: loadingReview } = useBookingReview(bookingId);
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const existingReview = existingReviewData?.data?.review;
  const isEditing = !!existingReview;

  // Initialize form with existing review data
  useState(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  });

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      if (isEditing && existingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview.id,
          rating,
          comment: comment || undefined,
        });
      } else {
        await createReviewMutation.mutateAsync({
          bookingId,
          rating,
          comment: comment || undefined,
        });
      }
      onClose();
      setRating(0);
      setComment("");
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Your Review" : "Leave a Review"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update your review for ${vendorName}`
              : `Share your experience with ${vendorName} for "${eventTitle}"`}
          </DialogDescription>
        </DialogHeader>

        {loadingReview ? (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 && (
                    <>
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/500 characters
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size="sm" className="mr-2" />
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : isEditing ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

