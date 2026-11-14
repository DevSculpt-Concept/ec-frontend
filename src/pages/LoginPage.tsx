import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { Eye, EyeOff, LogIn, Mail, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogin, useForgotPassword, useResendConfirmation } from "@/hooks/useAuth";

export function LoginPage() {
  const location = useLocation();

  // Check URL params to determine if vendor login
  const searchParams = new URLSearchParams(location.search);
  const isVendorLogin = searchParams.get("type") === "vendor";

  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "sent">("request");
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonials = [
    {
      text: "The Curry Fabulous Family has transformed how I manage my event business. The streamlined booking system keeps everything organized and efficient!",
      name: "Marcus Chen",
      role: "Event Coordinator",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      text: "As a vendor, The Curry Fabulous Family has helped me reach more clients and grow my business. The platform is intuitive and the support is excellent!",
      name: "Sarah Johnson",
      role: "Catering Professional",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      text: "The best platform for finding reliable vendors. Every booking has been smooth, and the quality of service is outstanding!",
      name: "David Thompson",
      role: "Wedding Planner",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  ];

  const loginMutation = useLogin();
  const forgotPasswordMutation = useForgotPassword();
  const resendConfirmationMutation = useResendConfirmation();

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowVerificationMessage(false);
    setResendSuccess(false);

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      
      // Check if error is about email verification
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes("verify your email") || 
          lowerMessage.includes("email not confirmed") ||
          lowerMessage.includes("email verification") ||
          lowerMessage.includes("verification email")) {
        setShowVerificationMessage(true);
        setVerificationEmail(formData.email);
        setError(null);
        setResendSuccess(false);
      } else {
        setError(errorMessage);
        setShowVerificationMessage(false);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setResendSuccess(false);
    setError(null);
    
    try {
      await resendConfirmationMutation.mutateAsync(verificationEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
    setError(null);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await forgotPasswordMutation.mutateAsync(resetEmail);
      setResetStep("sent");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back! Login to your account
            </h2>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Email Verification Message */}
          {showVerificationMessage && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-primary-900 mb-1">
                      Please verify your email address
                    </h3>
                    <p className="text-sm text-primary-800">
                      A verification email has been sent to <strong>{verificationEmail}</strong>. 
                      Please check your inbox and click the verification link to activate your account.
                    </p>
                  </div>
                  
                  {resendSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✓ Verification email sent successfully! Please check your inbox.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-primary-700">
                        Didn't receive the email?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendConfirmationMutation.isPending}
                        className="text-primary-700 border-primary-300 hover:bg-primary-100"
                      >
                        {resendConfirmationMutation.isPending ? (
                          <>
                            <Loader size="sm" className="mr-2" />
                            Sending...
                          </>
                        ) : (
                          "Resend Verification Email"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Helper Links */}
            <div className="flex justify-end items-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-semibold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Image with Overlay */}
      <div className="hidden lg:flex lg:w-[40%] relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/sign-up-side-image.png)",
          }}
        />
        {/* Primary Color Overlay */}
        <div className="absolute inset-0 bg-primary/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full min-h-screen">
          {/* Login Icon */}
          <div className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                Secure Login
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12 flex-1 flex flex-col justify-center py-12">
            <div>
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                {isVendorLogin ? (
                  <>
                    Welcome Back,
                    <br />
                    Vendor!
                  </>
                ) : (
                  <>
                    Welcome Back to
                    <br />
                    The Curry Fabulous Family
                  </>
                )}
              </h1>
              <p className="text-white/90 text-lg leading-relaxed">
                {isVendorLogin ? (
                  <>
                    Continue managing your business on{" "}
                    <span className="font-semibold italic">The Curry Fabulous Family</span>.
                    Access your vendor dashboard, manage bookings, and grow your
                    business.
                  </>
                ) : (
                  <>
                    Continue your journey on{" "}
                    <span className="font-semibold italic">The Curry Fabulous Family</span>{" "}
                    where event planners and vendors come together seamlessly.
                    Access your personalized dashboard and manage your events
                    with ease.
                  </>
                )}
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="min-w-full bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-6"
                    >
                      <p className="text-white/95 leading-relaxed">
                        {testimonial.text}
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-white/80 text-sm">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Dots */}
              <div className="flex gap-2 justify-center mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentSlide
                        ? "bg-white w-6"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Spacer */}
          <div className="pb-4" />
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-md">
          {resetStep === "request" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Forgot Password?</DialogTitle>
                <DialogDescription>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleResetRequest} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setError(null);
                    }}
                    disabled={forgotPasswordMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Check Your Email</DialogTitle>
                <DialogDescription>
                  We've sent a password reset link to your email address.
                </DialogDescription>
              </DialogHeader>

              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-gray-600 mb-4">{resetEmail}</p>
                <p className="text-sm text-gray-600">
                  Please check your inbox and follow the instructions to reset
                  your password.
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setResetStep("request");
                    setResetEmail("");
                  }}
                  className="w-full"
                >
                  Return to Login
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
