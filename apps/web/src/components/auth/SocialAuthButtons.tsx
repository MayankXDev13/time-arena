
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface SocialAuthButtonsProps {
  mode: "signin" | "signup";
}

export function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const { signInWithGoogle, signInWithGitHub } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading("google");
    const result = await signInWithGoogle();
    if (result.error) {
      console.error("Google auth failed:", result.error.message);
      setLoading(null);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading("github");
    const result = await signInWithGitHub();
    if (result.error) {
      console.error("GitHub auth failed:", result.error.message);
      setLoading(null);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading !== null}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-[#1d232e] text-sm font-semibold text-white transition hover:bg-[#242c3a] disabled:opacity-60"
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
          )}
          Google
        </button>

        <button
          type="button"
          onClick={handleGitHubAuth}
          disabled={loading !== null}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-[#1d232e] text-sm font-semibold text-white transition hover:bg-[#242c3a] disabled:opacity-60"
        >
          {loading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-[18px] w-[18px] fill-white" viewBox="0 0 24 24">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          )}
          GitHub
        </button>
      </div>
      <span className="sr-only">{mode}</span>
    </div>
  );
}
