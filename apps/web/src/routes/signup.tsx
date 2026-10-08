
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthShell
      eyebrow="First bout is free"
      title="Claim your corner"
      description="Name your craft, set your round length, and fight your first 25 minutes today."
      bottomNote={
        <>
          Already have a card?{" "}
          <Link to="/signin" className="font-semibold text-[#f0642b] hover:underline">
            Step back in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
