import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/redux/hooks";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      // Navigate to appropriate dashboard based on role
      if (user.role === "vendor") {
        navigate("/vendor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 mb-4">404</h1>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
            <div className="relative bg-white rounded-2xl p-12 shadow-lg">
              <div className="w-32 h-32 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="w-5 h-5 mr-2" />
            {isAuthenticated && user?.role === "vendor" 
              ? "Go to Dashboard"
              : isAuthenticated && user?.role === "admin"
              ? "Go to Admin"
              : "Go to Home"}
          </Button>
          {!isAuthenticated && (
            <Button
              onClick={() => navigate("/search")}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Vendors
            </Button>
          )}
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate("/search")}
              className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
            >
              Search Vendors
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/services")}
              className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
            >
              Our Services
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/contact")}
              className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

