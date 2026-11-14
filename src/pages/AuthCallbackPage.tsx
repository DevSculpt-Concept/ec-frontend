import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { authService } from "@/services/api/auth.service";

/** Landing page for the link in the verification email: /auth/callback?token=... */
export function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("We're verifying your account. This will only take a moment.");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ran = useRef(false); // the token is single-use – guard against StrictMode double effects

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token. Please use the link from your email.");
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been successfully verified! You're now part of The Curry Fabulous Family.");
        showToast.success("Verification successful", "Your account is now active.");
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message || "We couldn't verify your account. The link may have expired or was already used.");
      });
  }, [searchParams]);

  const handleContinue = () => navigate("/login");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header Decor */}
        <div className={`h-2.5 w-full ${
          status === 'success' ? 'bg-green-500' : 
          status === 'error' ? 'bg-red-500' : 
          'bg-primary animate-pulse'
        }`} />
        
        <div className="p-10 md:p-14 space-y-10 flex flex-col items-center">
          {/* Status Icon */}
          <div className="relative">
            {status === "loading" && (
              <div className="relative flex items-center justify-center">
                 <div className="p-8 bg-primary/5 rounded-full relative">
                   <div className="absolute inset-0 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                   <Loader2 className="w-14 h-14 text-primary animate-pulse" />
                 </div>
              </div>
            )}

            {status === "success" && (
              <div className="bg-green-50 p-8 rounded-full shadow-inner">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-50 p-8 rounded-full shadow-inner">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {status === "loading" && "Verifying Account"}
              {status === "success" && "Account Verified!"}
              {status === "error" && "Verification Issue"}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mt-2">
              {message}
            </p>
          </div>

          {/* Action Button */}
          <div className="w-full pt-2">
            {status === "loading" ? (
              <div className="h-16 w-full bg-gray-100 rounded-2xl animate-pulse" />
            ) : (
              <Button 
                onClick={status === "success" ? handleContinue : () => navigate("/login")}
                size="lg"
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 translate-y-0 hover:-translate-y-1 active:translate-y-0"
              >
                {status === "success" ? (
                  <>
                    Continue to Login <ArrowRight className="w-6 h-6" />
                  </>
                ) : (
                  "Return to Login"
                )}
              </Button>
            )}
          </div>
          
          {status === "error" && (
            <p className="text-sm text-gray-500">
              Need help? <button onClick={() => navigate("/contact")} className="text-primary font-semibold hover:underline">Contact Support</button>
            </p>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50/50 px-10 py-6 border-t border-gray-100 text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            The Curry Fabulous Family
          </p>
        </div>
      </div>
    </div>
  );
}
