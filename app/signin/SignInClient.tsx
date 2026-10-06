"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { SignInForm } from "@/components/auth/SignInForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Step back in"
      description="Your record kept your seat warm. Pick up where the bell left off."
    >
      {message && (
        <div className="rounded-xl border border-green-800/30 bg-green-950/40 px-4 py-3 text-center text-sm text-green-200">
          {message}
        </div>
      )}

      <SignInForm />

      <p className="text-center text-sm text-muted-foreground">
        New to the arena?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create your fighter card
        </Link>
      </p>
    </AuthShell>
  );
}
