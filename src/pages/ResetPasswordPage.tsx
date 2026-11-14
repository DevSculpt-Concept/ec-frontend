import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";

/** Landing page for the link in the password-reset email: /reset-password?token=... */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const reset = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be at least 8 characters and contain a letter and a number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await reset.mutateAsync({ password, token });
      showToast.success("Password updated", "You can now log in with your new password.");
      navigate("/login");
    } catch (err) {
      setError((err as Error).message || "This reset link is invalid or has expired.");
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <p className="text-gray-600">Please use the link from your email, or request a new one from the login page.</p>
        <Button asChild><Link to="/login">Back to login</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
          <p className="text-gray-600">Enter a new password for your account.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-3.5 text-gray-400" aria-label="Toggle password visibility">
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

        <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold" disabled={reset.isPending}>
          {reset.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
