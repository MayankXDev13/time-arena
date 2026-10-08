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
      bottomNote={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#f0642b] hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {message && (
        <div className="mb-4 rounded-[10px] border border-green-500/25 bg-green-500/10 px-4 py-3 text-center text-sm text-green-300">
          {message}
        </div>
      )}

      <SignInForm />
    </AuthShell>
  );
}
