import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { VendorGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Camera, Filter, MapPin, Search, Star, X, AlertCircle, XCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearchVendors } from "@/hooks/useSearch";
import type { Vendor } from "@/services/api/search.service";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get initial values from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categories = searchParams.get("categories");
    return categories ? categories.split(",") : [];
  });
  const [priceRange, setPriceRange] = useState(
    searchParams.get("price") || "all"
  );
  const [priceMin, setPriceMin] = useState<string>(
    searchParams.get("priceMin") || ""
  );
  const [priceMax, setPriceMax] = useState<string>(
    searchParams.get("priceMax") || ""
  );
  const [minRating, setMinRating] = useState(
    searchParams.get("rating") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Map category values to backend service types
  const mapCategoryToServiceType = (category: string): string | undefined => {
    const categoryMap: Record<string, string> = {
      "photography": "photography",
      "catering": "catering",
      "event-planning": "event_planning",
      "decoration": "decoration",
    };
    return categoryMap[category];
  };

  // Map price range to min/max values (in NGN)
  const mapPriceRange = (priceRange: string): { min?: number; max?: number } => {
    const priceMap: Record<string, { min?: number; max?: number }> = {
      "budget": { max: 50000 }, // Up to 50,000 NGN
      "mid": { min: 50000, max: 200000 }, // 50,000 - 200,000 NGN
      "premium": { min: 200000 }, // 200,000+ NGN
    };
    return priceMap[priceRange] || {};
  };

  // Build search filters from URL params and state
  const searchFilters = useMemo(() => {
    const filters: {
      page: number;
      limit: number;
      sortBy?: "rating" | "reviews" | "price-low" | "price-high" | "featured";
      serviceTypes?: string | string[];
      location?: string;
      query?: string;
      priceMin?: number;
      priceMax?: number;
      rating?: number;
    } = {
      page,
      limit: 20, // 20 vendors per page
      sortBy: (sortBy === "featured" ? "rating" : (["rating", "reviews", "price-low", "price-high", "featured"].includes(sortBy) ? sortBy : "rating")) as "rating" | "reviews" | "price-low" | "price-high" | "featured",
    };

    // Add search query for vendor/business name search
    if (searchQuery && searchQuery.trim().length > 0) {
      filters.query = searchQuery.trim();
    }

    // Get service types from selected categories
    if (selectedCategories.length > 0) {
      const serviceTypes = selectedCategories
        .map(cat => mapCategoryToServiceType(cat))
        .filter((type): type is string => type !== undefined);
      if (serviceTypes.length > 0) {
        filters.serviceTypes = serviceTypes;
      }
    } else {
      // Fallback to URL param if no categories selected
      const serviceType = searchParams.get("serviceType");
      if (serviceType) {
        filters.serviceTypes = serviceType;
      }
    }

    // Get location from URL param
    const locationFromUrl = searchParams.get("location");
    if (locationFromUrl) {
      filters.location = locationFromUrl;
    }

    // Rating filter
    if (minRating !== "all") {
      filters.rating = parseFloat(minRating);
      // When rating filter is applied, sort by rating
      if (sortBy === "featured" || sortBy === "rating") {
        filters.sortBy = "rating";
      }
    }

    // Price range - map to min/max
    if (priceMin || priceMax) {
      if (priceMin) {
        filters.priceMin = parseFloat(priceMin);
      }
      if (priceMax) {
        filters.priceMax = parseFloat(priceMax);
      }
    } else if (priceRange !== "all") {
      const priceRangeMap = mapPriceRange(priceRange);
      if (priceRangeMap.min !== undefined) {
        filters.priceMin = priceRangeMap.min;
      }
      if (priceRangeMap.max !== undefined) {
        filters.priceMax = priceRangeMap.max;
      }
    }

    return filters;
  }, [selectedCategories, minRating, priceRange, priceMin, priceMax, sortBy, searchQuery, searchParams, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, minRating, priceRange, priceMin, priceMax, sortBy, searchQuery]);

  // Fetch vendors
  const { data: searchData, isLoading, isError, error } = useSearchVendors(searchFilters);

  const vendors = searchData?.data?.vendors || [];
  const pagination = searchData?.data?.pagination;

  const handleViewProfile = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
  };

  // Sync filter state with URL params on mount
  useEffect(() => {
    const categories = searchParams.get("categories");
    const price = searchParams.get("price");
    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort");
    const query = searchParams.get("q");

    if (categories) setSelectedCategories(categories.split(","));
    if (price) setPriceRange(price);
    if (priceMinParam) setPriceMin(priceMinParam);
    if (priceMaxParam) setPriceMax(priceMaxParam);
    if (rating) setMinRating(rating);
    if (sort) setSortBy(sort);
    if (query) setSearchQuery(query);
    const pageParam = searchParams.get("page");
    if (pageParam) setPage(parseInt(pageParam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL params when filters change (debounced)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (priceRange !== "all") params.set("price", priceRange);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (minRating !== "all") params.set("rating", minRating);
    if (sortBy !== "rating") params.set("sort", sortBy);
    if (page > 1) params.set("page", page.toString());

    // Update URL without triggering navigation
    const newUrl = `/search?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [selectedCategories, minRating, priceRange, priceMin, priceMax, sortBy, searchQuery, page]);

  const handleSearch = () => {
    // Update URL params with current filters
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (priceRange !== "all") params.set("price", priceRange);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (minRating !== "all") params.set("rating", minRating);
    if (sortBy !== "rating") params.set("sort", sortBy);
    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleClearFilters = () => {
    // Clear all filter states
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange("all");
    setPriceMin("");
    setPriceMax("");
    setMinRating("all");
    setSortBy("rating");
    setPage(1);
    // Clear URL params and navigate to clean search page
    navigate("/search");
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategories.length > 0 ||
      priceRange !== "all" ||
      priceMin !== "" ||
      priceMax !== "" ||
      minRating !== "all" ||
      searchParams.get("serviceType") !== null ||
      searchParams.get("location") !== null ||
      searchParams.get("eventType") !== null
    );
  }, [searchQuery, selectedCategories, priceRange, priceMin, priceMax, minRating, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by vendor name, business name, or location"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              size="lg"
              className="px-8 hidden sm:flex"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
            <Button size="lg" className="px-4 sm:hidden" onClick={handleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`
              fixed lg:static inset-0 z-40 lg:z-0
              w-full lg:w-80 flex-shrink-0
              bg-black/50 lg:bg-transparent
              transition-opacity duration-300
              ${filtersOpen
                ? "opacity-100"
                : "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"
              }
            `}
            onClick={() => setFiltersOpen(false)}
          >
            <div
              className={`
                h-full lg:h-auto
                w-80 lg:w-full
                bg-white
                p-6 lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200
                space-y-6
                lg:sticky lg:top-24
                overflow-y-auto
                transform transition-transform duration-300
                ${filtersOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between lg:block border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary-600 gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Clear
                    </Button>
                  )}
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Categories
                </h3>
                <div className="space-y-2.5">
                  {[
                    { value: "photography", label: "Photography" },
                    { value: "catering", label: "Catering" },
                    { value: "event-planning", label: "Event Planning" },
                    { value: "decoration", label: "Decoration" },
                  ].map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => handleCategoryToggle(category.value)}
                        className="cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900">
                        {category.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Price Range
                </h3>

                {/* Preset Options */}
                <div className="space-y-2">
                  <select
                    value={priceRange}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      // Clear custom inputs when preset is selected
                      if (e.target.value !== "custom") {
                        setPriceMin("");
                        setPriceMax("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Budget Friendly (Up to ₦50,000)</option>
                    <option value="mid">Mid Range (₦50,000 - ₦200,000)</option>
                    <option value="premium">Premium (₦200,000+)</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Custom Range Inputs */}
                {priceRange === "custom" && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        Minimum Price (₦)
                      </label>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        Maximum Price (₦)
                      </label>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="No limit"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Minimum Rating */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Minimum Rating
                </h3>
                <div className="space-y-2.5">
                  {[
                    { value: "all", label: "All Ratings" },
                    { value: "3.0", label: "3.0+ stars" },
                    { value: "3.5", label: "3.5+ stars" },
                    { value: "4.0", label: "4.0+ stars" },
                    { value: "4.5", label: "4.5+ stars" },
                    { value: "4.8", label: "4.8+ stars" },
                  ].map((rating) => (
                    <label
                      key={rating.value}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating.value}
                        onChange={() => setMinRating(rating.value)}
                        className="w-4 h-4 text-primary border-gray-300 rounded-full focus:ring-primary focus:ring-2 cursor-pointer"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900 flex items-center gap-1">
                        {rating.label}
                        {rating.value !== "all" && (
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Vendor Grid */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-48" />
                  </div>
                ) : isError ? (
                  "Error loading vendors"
                ) : (
                  `${pagination?.totalResults || 0} Vendor${(pagination?.totalResults || 0) !== 1 ? "s" : ""} Found`
                )}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {isError && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-8 mb-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Vendors</h3>
                    <p className="text-sm text-red-800 mb-4">
                      {error instanceof Error
                        ? error.message
                        : "We encountered an issue while searching for vendors. Please try again."}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Refresh Page
                      </Button>
                      <Button
                        onClick={handleClearFilters}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader size="sm" />
                  <span className="text-sm text-gray-600">Searching for vendors...</span>
                </div>
                <VendorGridSkeleton count={6} />
              </div>
            )}

            {/* Vendor Cards Grid */}
            {!isLoading && !isError && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  {vendors.length === 0 ? (
                    <div className="col-span-2 text-center py-12 space-y-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No vendors found
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {hasActiveFilters
                              ? "We couldn't find any vendors matching your filters. Try adjusting your search criteria."
                              : "No vendors are currently available. Please check back later."}
                          </p>
                          {hasActiveFilters && (
                            <Button
                              onClick={handleClearFilters}
                              variant="outline"
                              className="gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    vendors.map((vendor: Vendor, index: number) => (
                      <div
                        key={vendor.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        {/* Vendor Image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden group">
                          {vendor.profileImageUrl ? (
                            <img
                              src={vendor.profileImageUrl}
                              alt={vendor.businessName}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 ${vendor.profileImageUrl ? 'hidden' : ''}`}
                          >
                            <span className="text-4xl font-bold text-primary-600">
                              {vendor.businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {vendor.isVerified && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Vendor Info */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                              {vendor.businessName}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {vendor.rating.average.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({vendor.rating.totalReviews})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Camera className="w-4 h-4" />
                            <span className="capitalize">{vendor.serviceTypes.join(", ")}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="capitalize">{vendor.primaryLocation}</span>
                          </div>

                          <div className="text-sm font-semibold text-primary">
                            {vendor.priceRange.min !== null && vendor.priceRange.max !== null ? (
                              <>NGN {vendor.priceRange.min.toLocaleString()} - NGN {vendor.priceRange.max.toLocaleString()}</>
                            ) : vendor.priceRange.min !== null ? (
                              <>NGN {vendor.priceRange.min.toLocaleString()}+</>
                            ) : vendor.priceRange.max !== null ? (
                              <>Up to NGN {vendor.priceRange.max.toLocaleString()}</>
                            ) : (
                              <span className="text-gray-500">Price on request</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewProfile(vendor.id)}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!pagination.hasPrevPage || isLoading}
                      className="cursor-pointer"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage((p) => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

    </div>
  );
}
