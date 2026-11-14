import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Eye, EyeOff, UserPlus, AlertCircle, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRegister, useResendConfirmation } from "@/hooks/useAuth";

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [resendSuccess, setResendSuccess] = useState(false);
  const resendConfirmationMutation = useResendConfirmation();

  const handleResendVerification = async () => {
    setResendSuccess(false);
    setError(null);
    try {
      await resendConfirmationMutation.mutateAsync(formData.email);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email. Please try again.");
    }
  };

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonials = [
    {
      text: "Finding trusted vendors was tough—until I found The Curry Fabulous Family. Now, booking decorators, caterers, and more is quick, easy, and reliable!",
      name: "Daphne Park",
      role: "Event Planner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      text: "The Curry Fabulous Family made my wedding planning so much easier! I found the perfect photographer, caterer, and decorator all in one place. Highly recommend!",
      name: "Emily Rodriguez",
      role: "Bride-to-be",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      text: "As a corporate event manager, The Curry Fabulous Family has been a game-changer. The platform is professional, reliable, and saves me so much time!",
      name: "Michael Chen",
      role: "Corporate Event Manager",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
  ];

  const registerMutation = useRegister();

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

    // Split full name into first and last name
    const nameParts = formData.firstName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!firstName) {
      setError("Please enter your full name");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        role: "user",
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image with Overlay */}
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
          {/* Sign Up Icon */}
          <div className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                Join Us Today
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12 flex-1 flex flex-col justify-center py-12">
            <div>
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                Connecting Events to Exceptional Vendors
              </h1>
              <p className="text-white/90 text-lg leading-relaxed">
                Discover endless possibilities on{" "}
                <span className="font-semibold italic">The Curry Fabulous Family</span>{" "}
                where event planners meet top-rated vendors with ease.
                Whether you're planning a wedding, party, or corporate event
                — we've got the right talent for you. Jump right in with us!
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

      {/* Right Side - Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {registerMutation.isSuccess ? (
            <div className="space-y-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Verify your email
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We've sent a verification link to <strong className="text-gray-900">{formData.email}</strong>.
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>

              {resendSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  ✓ Verification email resent successfully! Please check your inbox.
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendConfirmationMutation.isPending}
                    variant="outline"
                    className="w-full py-3"
                  >
                    {resendConfirmationMutation.isPending ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Resending...
                      </>
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Create your account with us below
                </h2>
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Login
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="David Goliath"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

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
                      placeholder="Create your password"
                      required
                      minLength={6}
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
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
