import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePortfolioItem, useReactToPortfolio, useRemoveReaction, useCommentOnPortfolio, useRatePortfolio } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Star,
  Calendar,
} from "lucide-react";
import { useAppSelector } from "@/store/redux/hooks";
import { showToast } from "@/lib/toast";

export function PortfolioDetailPage() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const { data, isLoading, isError, error } = usePortfolioItem(portfolioId || null);
  const reactMutation = useReactToPortfolio();
  const removeReactionMutation = useRemoveReaction();
  const commentMutation = useCommentOnPortfolio();
  const rateMutation = useRatePortfolio();

  const portfolioItem = data?.data?.item;
  const comments = data?.data?.comments || [];
  const userReaction = data?.data?.userReaction;
  const userRatingFromServer = data?.data?.userRating;

  // Initialize rating from server data
  useEffect(() => {
    if (userRatingFromServer !== null && userRatingFromServer !== undefined) {
      setRating(userRatingFromServer);
    }
  }, [userRatingFromServer]);

  // Optimistic state for reactions
  const [optimisticReaction, setOptimisticReaction] = useState<"like" | "dislike" | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
  const [optimisticDislikes, setOptimisticDislikes] = useState<number | null>(null);
  const [optimisticRating, setOptimisticRating] = useState<number | null>(null);
  const [optimisticAverageRating, setOptimisticAverageRating] = useState<number | null>(null);
  const [optimisticTotalRatings, setOptimisticTotalRatings] = useState<number | null>(null);

  const currentReaction = optimisticReaction !== null ? optimisticReaction : (userReaction ?? null);
  const currentLikes = optimisticLikes !== null ? optimisticLikes : (portfolioItem?.likes_count || 0);
  const currentDislikes = optimisticDislikes !== null ? optimisticDislikes : (portfolioItem?.dislikes_count || 0);
  const currentRating = optimisticRating !== null ? optimisticRating : (rating !== null ? rating : userRatingFromServer);
  const currentAverageRating = optimisticAverageRating !== null ? optimisticAverageRating : (portfolioItem?.average_rating || 0);
  const currentTotalRatings = optimisticTotalRatings !== null ? optimisticTotalRatings : (portfolioItem?.total_ratings || 0);

  const handleReaction = async (reactionType: "like" | "dislike") => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!portfolioId || !portfolioItem) return;

    // Optimistic update
    const previousReaction = currentReaction;
    const previousLikes = currentLikes;
    const previousDislikes = currentDislikes;

    if (previousReaction === reactionType) {
      // Remove reaction
      setOptimisticReaction(null);
      if (reactionType === "like") {
        setOptimisticLikes(Math.max(0, previousLikes - 1));
      } else {
        setOptimisticDislikes(Math.max(0, previousDislikes - 1));
      }
    } else {
      // Add/change reaction
      setOptimisticReaction(reactionType);
      if (reactionType === "like") {
        setOptimisticLikes(previousLikes + (previousReaction === "dislike" ? 1 : 1));
        if (previousReaction === "dislike") {
          setOptimisticDislikes(Math.max(0, previousDislikes - 1));
        }
      } else {
        setOptimisticDislikes(previousDislikes + (previousReaction === "like" ? 1 : 1));
        if (previousReaction === "like") {
          setOptimisticLikes(Math.max(0, previousLikes - 1));
        }
      }
    }

    try {
      // If user already has this reaction, remove it
      if (previousReaction === reactionType) {
        await removeReactionMutation.mutateAsync(portfolioId);
      } else {
        // Otherwise, set the new reaction
        await reactMutation.mutateAsync({ portfolioId, reactionType });
      }
      // Reset optimistic state after success
      setOptimisticReaction(null);
      setOptimisticLikes(null);
      setOptimisticDislikes(null);
    } catch (error: any) {
      // Revert optimistic update on error
      setOptimisticReaction(previousReaction ?? null);
      setOptimisticLikes(previousLikes);
      setOptimisticDislikes(previousDislikes);
      showToast.error("Failed to save reaction", error.message);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!commentText.trim() || !portfolioId) return;

    try {
      await commentMutation.mutateAsync({ portfolioId, comment: commentText.trim() });
      setCommentText("");
      showToast.success("Comment added successfully");
    } catch (error: any) {
      showToast.error("Failed to add comment", error.message);
    }
  };

  const handleRate = async (selectedRating: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!portfolioId || !portfolioItem) return;

    // Optimistic update
    const previousRating = currentRating;
    const previousAverageRating = currentAverageRating;
    const previousTotalRatings = currentTotalRatings;

    setOptimisticRating(selectedRating);
    // Simple optimistic average calculation (this is approximate)
    if (previousTotalRatings > 0 && previousAverageRating > 0) {
      const newTotal = previousRating ? previousTotalRatings : previousTotalRatings + 1;
      const newAverage = previousRating
        ? ((previousAverageRating * previousTotalRatings - previousRating + selectedRating) / previousTotalRatings)
        : ((previousAverageRating * previousTotalRatings + selectedRating) / newTotal);
      setOptimisticAverageRating(Math.max(0, Math.min(5, newAverage)));
      setOptimisticTotalRatings(newTotal);
    } else {
      setOptimisticAverageRating(selectedRating);
      setOptimisticTotalRatings(1);
    }

    try {
      await rateMutation.mutateAsync({ portfolioId, rating: selectedRating });
      setRating(selectedRating);
      // Reset optimistic state after success
      setOptimisticRating(null);
      setOptimisticAverageRating(null);
      setOptimisticTotalRatings(null);
    } catch (error: any) {
      // Revert optimistic update on error
      setOptimisticRating(previousRating ?? null);
      setOptimisticAverageRating(previousAverageRating);
      setOptimisticTotalRatings(previousTotalRatings);
      showToast.error("Failed to save rating", error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl mb-6" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !portfolioItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Item Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "The portfolio item you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {portfolioItem.media_type === "image" && (
                <img
                  src={portfolioItem.media_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop"}
                  alt={portfolioItem.title}
                  className="w-full h-auto max-h-[600px] object-contain bg-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop";
                    target.onerror = null;
                  }}
                />
              )}
              {portfolioItem.media_type === "video" && (
                <div className="relative">
                  <video
                    src={portfolioItem.media_url || ""}
                    controls
                    className="w-full h-auto max-h-[600px]"
                    poster="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop"
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      const container = target.parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="w-full h-[600px] bg-gradient-to-br from-primary-100 to-primary-200 flex flex-col items-center justify-center p-8">
                            <svg class="w-24 h-24 text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-gray-600 text-center">Video unavailable</p>
                          </div>
                        `;
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {portfolioItem.media_type === "youtube" && portfolioItem.youtube_url && (
                <div className="aspect-video">
                  <iframe
                    src={portfolioItem.youtube_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {!portfolioItem.media_type && (
                <div className="w-full h-[600px] bg-gradient-to-br from-primary-100 to-primary-200 flex flex-col items-center justify-center p-8">
                  <img
                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop"
                    alt="Portfolio placeholder"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex flex-col items-center justify-center p-8"><svg class="w-24 h-24 text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-gray-600 text-center">Media unavailable</p></div>';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{portfolioItem.title}</h1>
              {portfolioItem.description && (
                <p className="text-gray-600 mb-4">{portfolioItem.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(portfolioItem.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="capitalize">{portfolioItem.service_type.replace("_", " ")}</span>
                </div>
                {portfolioItem.cost && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">₦</span>
                    <span className="font-semibold">NGN {portfolioItem.cost.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleReaction("like")}
                  disabled={reactMutation.isPending || removeReactionMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentReaction === "like"
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${currentReaction === "like" ? "fill-current" : ""}`} />
                  <span className="font-medium">{currentLikes}</span>
                </button>
                <button
                  onClick={() => handleReaction("dislike")}
                  disabled={reactMutation.isPending || removeReactionMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentReaction === "dislike"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ThumbsDown className={`w-5 h-5 ${currentReaction === "dislike" ? "fill-current" : ""}`} />
                  <span className="font-medium">{currentDislikes}</span>
                </button>
                {currentAverageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{currentAverageRating.toFixed(1)}</span>
                    <span className="text-gray-500">({currentTotalRatings} ratings)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments ({portfolioItem.comments_count || 0})
              </h2>

              {/* Add Comment */}
              {isAuthenticated ? (
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!commentText.trim() || commentMutation.isPending}
                    >
                      {commentMutation.isPending ? <Loader size="sm" /> : "Post"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Please <button onClick={() => navigate("/login")} className="font-semibold underline">login</button> to comment
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                      {comment.user?.profile_image_url ? (
                        <img
                          src={comment.user.profile_image_url}
                          alt={comment.user?.full_name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {(comment.user?.full_name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.user?.full_name || "Unknown User"}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            {portfolioItem.vendor && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor</h3>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">{portfolioItem.vendor.business_name}</p>
                  {portfolioItem.vendor.average_rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{portfolioItem.vendor.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500">({portfolioItem.vendor.total_reviews || 0} reviews)</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/vendor/${portfolioItem.vendor?.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Rating Section */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rate this work</h3>
                <div className="flex gap-1 justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      disabled={rateMutation.isPending}
                      className={`transition-all duration-200 transform hover:scale-110 ${
                        currentRating && star <= currentRating
                          ? "text-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    >
                      <Star className={`w-8 h-8 ${currentRating && star <= currentRating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                {rateMutation.isPending && (
                  <p className="text-sm text-primary-600 text-center font-medium">Saving...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

