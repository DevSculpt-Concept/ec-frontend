/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVendorPortfolio, useReactToPortfolio, useRemoveReaction } from "@/hooks/usePortfolio";
import { useVendorDetails } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MessageCircle,
  Star,
  Heart,
  Youtube,
  Camera,
} from "lucide-react";
import { useAppSelector } from "@/store/redux/hooks";

export function AllPortfoliosPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [page, setPage] = useState(1);
  const [doubleTapTimeout, setDoubleTapTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [likedItems] = useState<Set<string>>(new Set());
  const [showLikeAnimation, setShowLikeAnimation] = useState<string | null>(null);

  const { data: vendorData } = useVendorDetails(vendorId || "");
  const { data, isLoading, isError } = useVendorPortfolio(vendorId || null, page, 20);
  const reactMutation = useReactToPortfolio();
  const removeReactionMutation = useRemoveReaction();

  const portfolioItems = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const vendor = vendorData?.data;

  // Handle double tap to like on mobile
  const handleDoubleTap = (itemId: string, currentReaction: string | null) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentReaction === "like") {
      // Already liked, remove like
      handleReaction(itemId, "like", true);
    } else {
      // Like the item
      handleReaction(itemId, "like", false);
      // Show animation
      setShowLikeAnimation(itemId);
      setTimeout(() => setShowLikeAnimation(null), 600);
    }
  };

  const handleTap = (itemId: string, currentReaction: string | null) => {
    if (doubleTapTimeout) {
      // Double tap detected
      clearTimeout(doubleTapTimeout);
      setDoubleTapTimeout(null);
      handleDoubleTap(itemId, currentReaction);
    } else {
      // First tap, wait for potential second tap
      const timeout = setTimeout(() => {
        setDoubleTapTimeout(null);
      }, 300);
      setDoubleTapTimeout(timeout);
    }
  };

  const handleReaction = async (itemId: string, reactionType: "like" | "dislike", isRemoving: boolean) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      if (isRemoving) {
        await removeReactionMutation.mutateAsync(itemId);
      } else {
        await reactMutation.mutateAsync({ portfolioId: itemId, reactionType });
      }
    } catch (error: any) {
      // Failed to save reaction
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    return () => {
      if (doubleTapTimeout) {
        clearTimeout(doubleTapTimeout);
      }
    };
  }, [doubleTapTimeout]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-32 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Portfolios</h1>
          <p className="text-gray-600 mb-4">Failed to load portfolio items. Please try again later.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="hidden md:flex"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {vendor?.businessName || "Portfolio"}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {pagination?.total || 0} {pagination?.total === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Instagram-like feed */}
        <div className="md:hidden space-y-4">
          {portfolioItems.map((item: any) => {
            const currentReaction = item.user_reaction || item.userReaction || null;
            const isLiked = currentReaction === "like" || likedItems.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Media */}
                <div
                  className="relative aspect-square bg-gray-100"
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleTap(item.id, currentReaction);
                  }}
                  onClick={() => navigate(`/portfolio/${item.id}`)}
                >
                  {item.media_type === "image" && (
                    <img
                      src={item.media_url || item.thumbnail_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop";
                        target.onerror = null;
                      }}
                    />
                  )}
                  {item.media_type === "video" && (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      poster={item.thumbnail_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"}
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        const container = target.parentElement;
                        if (container) {
                          container.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <svg class="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  )}
                  {item.media_type === "youtube" && item.youtube_url && (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Youtube className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Double tap like animation */}
                  {showLikeAnimation === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-ping" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleReaction(item.id, "like", isLiked)}
                        className={`transition-colors ${isLiked ? "text-red-500" : "text-gray-700"
                          }`}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => navigate(`/portfolio/${item.id}`)}
                        className="text-gray-700"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>
                    </div>
                    {item.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{item.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold">{item.likes_count || 0} likes</span>
                    {item.comments_count > 0 && (
                      <button
                        onClick={() => navigate(`/portfolio/${item.id}`)}
                        className="text-gray-600"
                      >
                        {item.comments_count} {item.comments_count === 1 ? "comment" : "comments"}
                      </button>
                    )}
                  </div>

                  {/* Title and description */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item: any) => (
            <div
              key={item.id}
              onClick={() => navigate(`/portfolio/${item.id}`)}
              className="bg-white rounded-xl shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-gray-100">
                {item.media_type === "image" && (
                  <img
                    src={item.media_url || item.thumbnail_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop";
                      target.onerror = null;
                    }}
                  />
                )}
                {item.media_type === "video" && (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    poster={item.thumbnail_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"}
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      const container = target.parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <svg class="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                )}
                {item.media_type === "youtube" && item.youtube_url && (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Youtube className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <Heart className="w-6 h-6" />
                      <span>{item.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-6 h-6" />
                      <span>{item.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(item.created_at)}</span>
                  {item.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{item.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {portfolioItems.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No portfolio items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

