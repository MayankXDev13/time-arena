"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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
      eyebrow="First bout is free"
      title="Claim your corner"
      description="Name your craft, set your round length, and fight your first 25 minutes today."
    >
      <SignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have a card?{" "}
        <Link href="/signin" className="font-semibold text-primary hover:underline">
          Step back in
        </Link>
      </p>
    </AuthShell>
  );
}
