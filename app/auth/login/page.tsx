"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Anchor, Mail, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 text-accent animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Anchor className="w-8 h-8 text-accent" />
          <span className="font-serif text-2xl text-text-primary tracking-tight">
            LandedCost
          </span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-serif text-2xl text-text-primary text-center mb-2">
            Sign in to LandedCost
          </h1>
          <p className="text-text-secondary text-sm text-center mb-8">
            Calculate your true landed cost in minutes
          </p>

          {/* Error messages */}
          {(error || authError) && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error || "Authentication failed. Please try again."}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 px-6 py-3.5 rounded-lg font-medium hover:bg-gray-100 transition-colors mb-6 disabled:opacity-50"
          >
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-secondary text-sm">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Magic Link Form */}
          {magicLinkSent ? (
            <div className="text-center py-4">
              <Mail className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="text-text-primary font-medium mb-1">
                Check your email
              </p>
              <p className="text-text-secondary text-sm mb-4">
                We sent a sign-in link to{" "}
                <span className="text-text-primary">{email}</span>
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="text-accent text-sm hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-text-secondary text-sm mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-background py-3.5 rounded-lg font-semibold hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
