"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-foreground">
            Time Arena
          </Link>
          <p className="text-muted-foreground mt-2">
            Boost your productivity with focused time tracking
          </p>
        </div>

        {/* Sign Up Form */}
        <SignUpForm />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}