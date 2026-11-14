/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Camera,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { useVendorDetails } from "@/hooks/useSearch";
import { useAppSelector } from "@/store/redux/hooks";
import AOS from "aos";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVendorReview } from "@/hooks/useReviews";
import { showToast } from "@/lib/toast";
import { formatPhoneForWhatsApp } from "@/lib/utils";

export function VendorProfilePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { data: vendorData, isLoading, isError, error } = useVendorDetails(vendorId || "");

  // Review form state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const createVendorReviewMutation = useCreateVendorReview();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast.error("Login required", "Please sign in to leave a review");
      return;
    }
    if (!reviewComment.trim()) {
      showToast.error("Comment required", "Please share your experience in the comment");
      return;
    }

    try {
      await createVendorReviewMutation.mutateAsync({
        vendorId: vendorId || "",
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      // Error handled by mutation
    }
  };



  useEffect(() => {
    AOS.refresh();
  }, [vendorData]);

  const vendor = vendorData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-12 w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Vendor</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Failed to load vendor profile. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/search")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Not Found</h1>
          <p className="text-gray-600">
            The vendor profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/search")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null; // Still loading
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              data-aos="fade-up"
            >
              {/* Cover Image */}
              <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200">
                {vendor.profileImageUrl ? (
                  <img
                    src={vendor.profileImageUrl}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-primary-600">
                      {vendor.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 capitalize">
                        {vendor.businessName}
                      </h1>
                      {vendor.isVerified && (
                        <CheckCircle className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {vendor.stats?.averageRating?.toFixed(1) || vendor.rating?.average?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm">
                          ({vendor.stats?.totalReviews || vendor.rating?.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">
                          {vendor.location?.primary || vendor.primaryLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Types */}
                {vendor.serviceTypes && vendor.serviceTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.serviceTypes.map((service: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
                      >
                        {service.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {vendor.bio && (
                  <p className="text-gray-700 leading-relaxed">{vendor.bio}</p>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div
              className="bg-white rounded-xl shadow-sm p-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {vendor.stats?.averageRating?.toFixed(1) || vendor.rating?.average?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {vendor.stats?.totalReviews || vendor.rating?.totalReviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            {vendor.pricing && vendor.pricing.length > 0 && (
              <div
                className="bg-white rounded-xl shadow-sm p-6"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.pricing.map((price: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-900 capitalize">
                          {price.service_type?.replace(/_/g, " ") || "Service"}
                        </div>
                        <div className="text-primary-600 font-bold">
                          ₦{price.price?.toLocaleString()}
                        </div>
                      </div>
                      {price.price_category && (
                        <div className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1">
                          {price.price_category}
                        </div>
                      )}
                      {price.description && (
                        <p className="text-sm text-gray-600 truncate-2-lines">
                          {price.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Section */}
            {vendor.portfolio && vendor.portfolio.length > 0 && (
              <div
                className="bg-white rounded-xl shadow-sm p-6"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary-600" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.portfolio.slice(0, 3).map((item: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/portfolio/${item.id}`)}
                      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={item.image_url || item.media_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop"}
                        alt={item.title || "Portfolio item"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop";
                          target.onerror = null;
                        }}
                      />
                      {item.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {vendor.portfolio.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => navigate(`/vendor/${vendorId}/portfolio`)}
                      variant="outline"
                    >
                      See All Portfolios ({vendor.portfolio.length})
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            <div
              className="bg-white rounded-xl shadow-sm p-6"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              </div>
              {vendor.recentReviews && vendor.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {vendor.recentReviews.map((review: any, index: number) => {
                    // Handle different possible structures: users object, direct user data, or reviewer_name (if any)
                    const userName = review.users?.full_name || review.user?.full_name || review.reviewer_name || review.full_name || "User";
                    return (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {userName}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < (review.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No reviews yet. Be the first to review this vendor!</p>
                </div>
              )}

              {/* Review Form */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Rating</label>
                      <div className="flex items-center gap-2 h-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 ${star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Your Comment</label>
                      <Textarea 
                        placeholder="Tell us about your experience with this vendor..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={createVendorReviewMutation.isPending}
                    >
                      {createVendorReviewMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-4 text-sm">You must be signed in to leave a review.</p>
                    <Link to="/login">
                      <Button variant="outline" size="sm" className="bg-white">
                        Sign In to Review
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

              {/* Price Range */}
              <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Price Range</div>
                <div className="text-2xl font-bold text-primary-600">
                  {vendor.priceRange?.min !== null && vendor.priceRange?.max !== null ? (
                    <>NGN {vendor.priceRange.min.toLocaleString()} - NGN {vendor.priceRange.max.toLocaleString()}</>
                  ) : vendor.priceRange?.min !== null ? (
                    <>NGN {vendor.priceRange.min.toLocaleString()}+</>
                  ) : vendor.priceRange?.max !== null ? (
                    <>Up to NGN {vendor.priceRange.max.toLocaleString()}</>
                  ) : (
                    <span className="text-gray-500">Price on request</span>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 mb-6">
                {!isAuthenticated ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900 mb-1">
                          Sign in to view contact information
                        </p>
                        <p className="text-xs text-yellow-700 mb-3">
                          Create an account or log in to access phone numbers, email, and WhatsApp.
                        </p>
                        <div className="flex gap-2">
                          <Link to="/login">
                            <Button size="sm" variant="outline" className="text-xs">
                              Login
                            </Button>
                          </Link>
                          <Link to="/signup">
                            <Button size="sm" className="text-xs">
                              Sign Up
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div id="contact-info" className="space-y-3">
                    {vendor.contact?.phone && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-primary-600" />
                        <a
                          href={`tel:${vendor.contact.phone}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {vendor.contact.phone}
                        </a>
                      </div>
                    )}
                    {vendor.contact?.whatsapp && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <a
                          href={`https://wa.me/${vendor.contact.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-600 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {vendor.contact?.email && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-5 h-5 text-primary-600" />
                        <a
                          href={`mailto:${vendor.contact.email}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {vendor.contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              {vendor.location && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Areas</h3>
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <div className="capitalize">{vendor.location.primary}</div>
                      {vendor.location.serviceAreas && vendor.location.serviceAreas.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          Also serves: {vendor.location.serviceAreas.map((area: string) => area).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(vendor.social?.website || vendor.social?.instagram || vendor.social?.facebook) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Follow Us</h3>
                  <div className="flex gap-3">
                    {vendor.social.website && (
                      <a
                        href={vendor.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    {vendor.social.instagram && (
                      <a
                        href={vendor.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    {vendor.social.facebook && (
                      <a
                        href={vendor.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              {!isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    Sign in to book this vendor
                  </p>
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full" size="lg">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1">
                      <Button className="w-full" size="lg">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg text-center">
                    <p className="text-sm text-gray-700 font-medium">
                      Ready to book? Contact this vendor directly to discuss your event details.
                    </p>
                  </div>
                  {vendor.contact?.whatsapp ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      size="lg"
                      onClick={() => {
                        const whatsapp = vendor.contact?.whatsapp;
                        if (whatsapp) {
                          window.open(`https://wa.me/${formatPhoneForWhatsApp(whatsapp)}`, "_blank");
                        }
                      }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact on WhatsApp
                    </Button>
                  ) : (
                    <Button
                      className="w-full cursor-pointer"
                      size="lg"
                      onClick={() => {
                        const contactSection = document.getElementById('contact-info');
                        contactSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Vendor
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



    </div>
  );
}

